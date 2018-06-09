import Immutable,{fromJS} from 'immutable';
import {isImmutable} from './utils';
import diff from 'immutablediff';
import patch from 'immutablepatch';
import History from './history';
import dataproxy from './dataproxy';
import uuidv1 from 'uuid/v1';

class DataStruct{
  constructor(o = {}){
    this._data = dataproxy(this, []);
    this.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.EVERY;
    this.subscribtions = new Map();

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
  toJS(){
    return this.immutable.toJSON();
  }
  subscribe(cbk){
    const key = Symbol('subscribtion');
    this.subscribtions.set(key, cbk);

    const unsubscribe = () => this.subscribtions.delete(key);
    return unsubscribe;
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
    let last = this._history.last();
    if(last.data !== this._immutable){
      throw new Error("You cannot call begin() while having already some changes");
    }
    if(this._version === last.uuid){
      this._version = commit || uuidv1();
    }
    this._started = user;
  }
  rollback(to){
    let history = this._history.rollback(to);
    this._version = history.uuid;
    this._immutable = history.data;
  }
  find(commit){
    this._history.rollback(commit);
  }
  diff(from,to){
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
  commit(user=true){
    const oldhistory = this._history.last();
    if(oldhistory.data !== this._immutable){
      this._history.onNew(this._version, this._immutable);
      this._started = false;
      if(user){
        let newhistory = this._history.last();
        let datadiff;
        this.subscribtions.forEach(subscribtion => {
          datadiff = datadiff || diff(oldhistory.data, newhistory.data);
          subscribtion(this._version, datadiff);
        });
      }
    }
  }
  /*
   * get list of commits
   */
  commits(fromPos, toPos = this._version){
    const from = this._history.find(fromPos);
    const to = this._history.find(toPos);

    if(from && to){
      const [fromId] = from;
      const [toId] = from;

      let ret = [];
      ret.length = toId - fromId;
      for(let i = fromId; i < toId; i++){
        const cur = this._history.nth(i);Z
        const next = this._history.nth(i+1);
        ret[i - fromId] = {
          diff: this.diff(cur.data, cur.data),
          uuid: next.uuid
        };
      }
      return ret;
    }
    return [];
  }

  /*
   * This function is called every time the user changes the immutable array
   */
  _autobegin(){
    if(!this._started)
      this.begin(false);
  }
  _autocommit(){
    if(!this._started && this.AUTOCOMMIT_STRATEGY !== DataStruct.AUTOCOMMIT_STRATEGIES.NEVER){
      if(this.AUTOCOMMIT_STRATEGY === DataStruct.AUTOCOMMIT_STRATEGIES.EVERY){
        this.commit();
      }else if(this.AUTOCOMMIT_STRATEGY === DataStruct.AUTOCOMMIT_STRATEGIES.ASYNC){
        if(!this._commitTimeout){
          this._commitTimeout = setTimeout(() => {
            this._commitTimeout = undefined;
            this.commit();
          },0)
        }
      }
    }
  }
}

DataStruct.AUTOCOMMIT_STRATEGIES = {
  NEVER: Symbol('never'),
  ASYNC: Symbol('async'),
  EVERY: Symbol('every')
}

export default DataStruct;
