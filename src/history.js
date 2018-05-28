import DEQueue from './queue';
import uuidv1 from 'uuid/v1';

export default class History{
  constructor(){
    this._history = new DEQueue([{uuid:uuidv1()}]);
  }
  onNew(uuid, data){
    this._history.append({uuid, data});
  }
  rollback(to){
    if(to){
      for(const [i, {uuid}] of this._history.beginEnd()){
        if(uuid === to){
          this._history.cutEnd(i);
        }
      }
    }
    return this.last();
  }
  last(){
    return this._history.last();
  }
}
