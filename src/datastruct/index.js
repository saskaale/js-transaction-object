import Immutable,{fromJS} from 'immutable';
import {isImmutable} from './utils';
import diff from 'immutablediff';
import patch from 'immutablepatch';
import History from './history';
import dataproxy from './dataproxy';
import uuidv1 from 'uuid/v4';
import Commitable from './commitable';

const DataStruct = Commitable(class{
  constructor(o = {}){
    this._data = dataproxy(this, []);
    this.fromJS({data: o});
  }

  /*********** Data accessors ************/
  get data(){
    return this._data;
  }
  set data(o){
    this._immutable = o;
    this._autocommit();
  }
  get immutable(){
    return this._immutable;
  }
  set immutable(o){
    o = o || {};
    if(!isImmutable(o))
      o = fromJS(o);
    this._immutable = o;
  }

  /***** TRANSACTION SUPPORT ******/
  batch(action){
    /***
      TODO: rewrite this with Immutable.withMutations
     ***/
    this.begin();
    action(this);
    this.commit();
  }
  get transactionUuid(){
    return this._version;
  }
  get inTransaction(){
    return this._started;
  }
  begin(user = true, commit = undefined){
    const [_,last] = this._history.last();
    if(last.data !== this._immutable){
      throw new Error("You cannot call begin() while having already some changes");
    }
    if(this._version === last.uuid){
      this._version = commit || uuidv1();
    }
    this._started = user;
  }
  rollback(to){
    let history = this._history.rollback(to)[1];
    this._version = history.uuid;
    this._immutable = history.data;
  }
  find(commit){
    return this._history.find(commit);
  }


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
      data: data.toJSON(),
      uuid,
      changes
    }
  }
  fromJS({data, uuid, changes = []}){
    this._started = false;

    this._version = uuid || uuidv1();
    this._immutable = undefined;  //so the autocommit would not cause the subscription call
    this._history = new History(this._version);
    this.begin(false, uuid);
    this.immutable = data;
    this.commit(false);
    changes.forEach(this.patch.bind(this));
  }

  /***** Diff and patch support *****/

  // diff between two immutable objects
  _diff(from,to){
    return diff(from,to).toJS();
  }
  patch({diff, uuid}){
    let prev_started = this._started;
    this.commit();
    this.begin(true, uuid);
    this.immutable = patch(this.immutable, fromJS(diff));
    // TODO: ADD Immutable patch for this baby
    this.commit();
    if(prev_started)
      this.begin();
  }
});

DataStruct.AUTOCOMMIT_STRATEGIES = Commitable.AUTOCOMMIT_STRATEGIES;
export default DataStruct;
