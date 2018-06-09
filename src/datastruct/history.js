import DEQueue from './queue';
import uuidv1 from 'uuid/v1';

export default class History{
  constructor(uuid){
    const d = {uuid};
    this._history = new DEQueue([d]);

    ['nth', 'last'].forEach(k =>{
      this[k] = this._history[k].bind(this._history)
    });
  }
  onNew(uuid, data){
    const d = {uuid,data};
    this._history.append(d);
//    this._search.set(uuid,d);
  }
  find(commit){
    for(const [i, {uuid}] of this._history.beginEnd()){
      if(uuid === commit){
        return [i, uuid];
      }
    }
  }
  rollback(to){
    if(to){
      if(to = find(to)){
        this._history.cutEnd(to[0]);
      }
    }
    return this.last();
  }
}
