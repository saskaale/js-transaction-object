import DEQueue from './queue';
import uuidv1 from 'uuid/v1';

export default class History{
  constructor(uuid){
    const d = {uuid};
    this._history = new DEQueue([d]);
//    this._search = new Map();
//    this._search.set(uuid,d);
  }
  onNew(uuid, data){
    const d = {uuid,data};
    this._history.append(d);
//    this._search.set(uuid,d);
  }
  rollback(to){
    if(to){
      for(const [i, {uuid}] of this._history.beginEnd()){
        if(uuid === to){
          this._history.cutEnd(i);
/*          for(let k = this._history.length-1; k >= i; k--){
  //          this._search.remove(this._history.pop_last(i).uuid);
            this._history.pop_last(i);
          }
*/          break;
        }
      }
    }
    return this.last();
  }
  get(uuid){
    return this._search.get(uuid);
  }
  last(){
    return this._history.last();
  }
}
