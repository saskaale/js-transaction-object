import Immutable,{fromJS} from 'immutable';
import {isImmutable} from './utils';
import diff from 'immutablediff';
import patch from 'immutablepatch';
import dataproxy from './dataproxy';
import uuidv1 from 'uuid/v4';
import Commitable from './behaviors/commitable';
import Exportable from './behaviors/exportable';

const DataStruct = Commitable(Exportable(class{
  constructor(o = {}){
    this.newUuid = uuidv1;
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

  // diff between two immutable objects
  _diff(from,to){
    return diff(from,to).toJS();
  }
  // diff between two immutable objects
  _patch(o,diff){
    return patch(o,fromJS(diff));
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
      this._version = commit || this.newUuid();
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
}));

DataStruct.AUTOCOMMIT_STRATEGIES = Commitable.AUTOCOMMIT_STRATEGIES;
export default DataStruct;
