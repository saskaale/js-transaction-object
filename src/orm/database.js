import {TinySeq} from '../utils';
import Entity from './entity';
import DataStruct from '../datastruct';

let defaultDatastruct;
let batch = (f) => f(defaultDatastruct);
defaultDatastruct = {
      data:{},
      batch,
      begin(){},
      commit(){},
      subscribe(){ return () => {}; }
};

export default class Database{
  constructor(datastruct = defaultDatastruct){
    datastruct.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.ASYNC;
    datastruct.subscribe(this._listenDataChange);

    this._datastruct = datastruct;

    this._data = datastruct.data;
    this.Entities = {};
  }

  _listenDataChange({diff}){
    console.log('listenTo ');
    console.log(diff);
    diff.forEach(({op, path, value}) => {
      switch(op){
        case 'add':
          break;
        case 'delete':
          break;
      }
//      path = path.substring(1).split('/');
    })
  }

  _createData(Entity, uuid){
    if(this._data[Entity][uuid] === undefined)
      this._data[Entity][uuid] = {};
    return this._data[Entity][uuid];
  }

  _add(entity){
    this[entity.className][entity.uuid] = entity;
  }

  _delete(entity){
    delete this[entity.className][entity.uuid];
    delete this._data[entity.className][entity.uuid];
  }

  build(){
    TinySeq(this.Entities).forEach((_, Entity) => {
      if(this._data[Entity] === undefined)
        this._data[Entity] = {};
    });

    TinySeq(this.Entities).forEach((Entity) => Entity.build(Entity, this));
  }

  initEntity(entity, ...args){
    this.Entities[entity.prototype.className] = entity;
    this[entity.prototype.className] = {};

    Entity.init(this, entity, ...args);
  }
}

const createDatabase = (name) => {
    const cl = class extends Database{};
    cl.className = name;
    return cl;
}

export {createDatabase}
