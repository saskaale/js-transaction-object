const AUTOCOMMIT_STRATEGIES = {
  NEVER: Symbol('never'),
  ASYNC: Symbol('async'),
  IMMEDIATE: Symbol('immediate')
};

const Commitable = (parent) => class extends parent{
  get AUTOCOMMIT_STRATEGY(){
    return this._autocommit_strategy || AUTOCOMMIT_STRATEGIES.IMMEDIATE;
  }
  set AUTOCOMMIT_STRATEGY(s){
    if(!Object.values(AUTOCOMMIT_STRATEGIES).find(e=>e===s)){
      throw new Error("strategy must be one of AUTOCOMMIT_STRATEGIES");
    }
    this._autocommit_strategy = s;
  }
  constructor(...args){
    super(...args);
    this.subscribtions = new Map();
  }
  subscribeAll(type, data, skipSubscribers){
    const tosend = {
      type,
      data
    };

    if(this.subscribtions){
      this.subscribtions.forEach(subscribtion => {
        if(skipSubscribers && skipSubscribers.has(subscribtion))
          return;
        try{
          subscribtion(tosend);
        }catch(e){
          console.error("!!!!ERROR in the subscribe occured");
          console.error(e);
        }
      });
    }
  }
  commit(user=true, skipSubscribers){
    const oldhistory = this._history.last()[1];
    if(oldhistory.data !== this.immutable){
      this._history.onNew(this._version, this.immutable);
      this._started = false;
      if(user && this.subscribtions.size){
        const newhistory = this._history.last()[1];
        const datadiff = this._commitMsg(oldhistory, newhistory);
        this.subscribeAll("commit", datadiff, skipSubscribers);
      }
    }
  }
  _commitMsg(cur, next){
    return {
      diff: this._diff(cur.data, next.data),
      uuid: next.uuid,
      srcuuid: cur.uuid
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
      const [toId] = to;

      let ret = [];
      ret.length = toId - fromId;
      for(let i = fromId; i < toId; i++){
        const cur = this._history.nth(i);
        const next = this._history.nth(i+1);
        ret[i - fromId] = this._commitMsg(cur, next);
      }
      return ret;
    }
    return [];
  }
  /*
   * Groupped commits according to the groups
   *
  diffCommits(from,to = this._version){
    from = this._history.find(from);
    to = this._history.find(to);
    if(!from || !to)
      throw new Error('not able to find from or to commit');
    return this._commitMsg(from[1], to[1]);
  }
*/

  subscribe(cbk){
    const key = Symbol('subscribtion');
    this.subscribtions.set(key, cbk);

    const unsubscribe = () => this.subscribtions.delete(key);
    return unsubscribe;
  }


  /***** Diff and patch support *****/

  patch({diff, uuid}, skipCommits){
    let prev_started = this._started;
    this.commit(true);
    this.begin(true, uuid);
    this.immutable = this._patch(this.immutable, diff);
    this.commit(true, skipCommits);
    if(prev_started)
      this.begin();
  }

  get commited(){
    return this._history.last()[1].data === this.immutable;
  }

  /*
   * This function is called every time the user changes the immutable array
   */
  _autobegin(){
    if(!this._started)
      this.begin(false);
  }
  _autocommit(){
    if(!this._started && this.AUTOCOMMIT_STRATEGY !== Commitable.AUTOCOMMIT_STRATEGIES.NEVER){
      if(this.AUTOCOMMIT_STRATEGY === Commitable.AUTOCOMMIT_STRATEGIES.IMMEDIATE){
        this.commit();
      }else if(this.AUTOCOMMIT_STRATEGY === Commitable.AUTOCOMMIT_STRATEGIES.ASYNC){
        if(!this._commitTimeout){
          this._commitTimeout = setTimeout(() => {
            this._commitTimeout = undefined;
            this.commit();
          },0)
        }
      }
    }
  }
};
Commitable.AUTOCOMMIT_STRATEGIES = AUTOCOMMIT_STRATEGIES;

export default Commitable;
