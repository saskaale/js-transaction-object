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

  /** shortcut **/
  static from(source){
    if(source instanceof DataStruct)
      source = source.toJS();

    let e = new DataStruct({});    
    e.fromJS(source);
    return e;
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
  get curVersion(){
    return this._version;
  }
  get inTransaction(){
    return this._started;
  }
  begin(user = true, commit = undefined){
    const [_,last] = this._history.last();
    if(last.data === this._immutable){
      if(this._version === last.uuid){
        this._version = commit || this.newUuid();
      }
      this._started = user;
    }
  }
  rollback(to = this._history.LAST_COMMIT){
    let history = this._history.rollback(to)[1];
    this._version = history.uuid;
    this._immutable = history.data;
  }
  find(commit, limitEnd){
    return this._history.find(commit, limitEnd);
  }
}));

DataStruct.AUTOCOMMIT_STRATEGIES = Commitable.AUTOCOMMIT_STRATEGIES;
export default DataStruct;
