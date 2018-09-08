import History from '../history';

export default (parent) => class extends parent{
    /* Serialization */
    toJS(from = this._version){
      const found = this.find(from);

      let data, uuid, changes, _;
      if(!found){
        throw new Warning('The uuid does not exists in the history');
        [_, {uuid,data}] = this._history.last();
        changes = [];
      }else{
        [_, {uuid,data}] = found;
        changes = this.commits(uuid, this._version);
      }

      return {
        data: data ? data.toJSON() : {},
        uuid,
        changes
      }
    }
    fromJS({data, uuid, changes = []}, skipSubscribers){
      this._started = false;

      this._version = uuid || this.newUuid();
      this._immutable = undefined;  //so the autocommit would not cause the subscription call
      this._history = new History(this._version);
      this.begin(false, uuid);
      this.immutable = data;
      this.commit(false);
      this.subscribeAll("reset", {data,uuid}, skipSubscribers);
      changes.forEach((e) => {
        this.patch(e, skipSubscribers);
      });
    }
};
