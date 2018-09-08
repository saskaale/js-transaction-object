import DEQueue from './queue';

export default class History{
  constructor(uuid){
    const d = {uuid};
    this._queue = new DEQueue([d]);

    ['nth'].forEach(k =>{
      this[k] = this._queue[k].bind(this._queue)
    });

    this.LAST_COMMIT = Symbol('last_commit');
  }
  onNew(uuid, data){
    const d = {uuid,data};
    this._queue.append(d);
  }
  last(){
    let d = this._queue.last();
    return [this._queue.length-1, d];
  }
  find(commit){
    if(typeof(commit) === 'number'){
      let foundResult = 0;
      if(commit < 0){
        commit = Math.max(commit, -this._queue.length);
        foundResult = this._queue.nth(this._queue.length+commit);
      }else if(commit >= 0){
        commit = Math.min(commit, this._queue.nth(commit)-1);
        foundResult = this._queue.nth(commit);
      }
      return [commit, foundResult];
    }
    for(const [i, d] of this._queue.beginEnd()){
      if(d.uuid === commit){
        return [i, d];
      }
    }
  }
  rollback(to){
    if(to !== this.LAST_COMMIT){
      if(typeof to === 'number'){
        this._queue.cutEnd(to);
      }else if(to = this.find(to)){
        this._queue.cutEnd(to[0]);
      }else{
        throw new Error('Rollback commit does not found')
      }
    }
    return this.last();
  }
}
