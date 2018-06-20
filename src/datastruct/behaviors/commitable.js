const AUTOCOMMIT_STRATEGIES = {
  NEVER: Symbol('never'),
  ASYNC: Symbol('async'),
  EVERY: Symbol('every')
};

const Commitable = (parent) => class extends parent{
  get AUTOCOMMIT_STRATEGY(){
    return this._autocommit_strategy || AUTOCOMMIT_STRATEGIES.EVERY;
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
  commit(user=true){
    const oldhistory = this._history.last()[1];
    if(oldhistory.data !== this.immutable){
      this._history.onNew(this._version, this.immutable);
      this._started = false;
      if(user){
        let newhistory = this._history.last()[1];
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
      const [toId] = to;

      let ret = [];
      ret.length = toId - fromId;
      for(let i = fromId; i < toId; i++){
        const cur = this._history.nth(i);
        const next = this._history.nth(i+1);
        ret[i - fromId] = {
          diff: this._diff(cur.data, next.data),
          uuid: next.uuid
        };
      }
      return ret;
    }
    return [];
  }

  subscribe(cbk){
    const key = Symbol('subscribtion');
    this.subscribtions.set(key, cbk);

    const unsubscribe = () => this.subscribtions.delete(key);
    return unsubscribe;
  }


  /***** Diff and patch support *****/

  patch({diff, uuid}){
    let prev_started = this._started;
    this.commit();
    this.begin(true, uuid);
    this.immutable = this._patch(this.immutable, diff);
    this.commit();
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
      if(this.AUTOCOMMIT_STRATEGY === Commitable.AUTOCOMMIT_STRATEGIES.EVERY){
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
