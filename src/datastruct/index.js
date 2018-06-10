import Immutable,{fromJS} from 'immutable';
import {isImmutable} from './utils';
import diff from 'immutablediff';
import patch from 'immutablepatch';
import History from './history';
import dataproxy from './dataproxy';
import uuidv1 from 'uuid/v1';
import Commitable from './commitable';

const DataStruct = Commitable(class{
  constructor(o = {}){
    this._data = dataproxy(this, []);
    this.replace(o);
  }
  replace(o, version){
    this._started = false;

    this._version = version || uuidv1();
    this._immutable = undefined;
    this._history = new History(this._version);
    this.begin(false);
    this.immutable = o;
    this.commit(false);
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
  toJSON(){
    return this.immutable.toJSON();
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


  /* Diff patch and init *
  toJS(from = this._version){
    const found = this.find(from);

    let data, uuid, changes;
    if(!found){
      throw new Warning('The uuid does not exists in the history');
      [_, {uuid,data}] = this._history.last();
      changes = [];
    }else{
      [_, {uuid,data}] = found;
      changes = this.changes(uuid, this._version);
    }

    return {
      data: this.immutable.toJSON(),
      uuid,
      changes
    }
  }
*/

  /***** Diff and patch support *****/

  // diff between two immutable objects
  _diff(from,to){
    return diff(from,to);
  }
  patch(diff, commit){
    let prev_started = this._started;
    this.commit();
    this.begin(true, commit);
    this.commit();
    if(prev_started)
      this.begin();
  }
});

DataStruct.AUTOCOMMIT_STRATEGIES = Commitable.AUTOCOMMIT_STRATEGIES;
export default DataStruct;
