import {TinySeq} from '../utils';
import Entity from './entity';

let defaultDatastruct;
let batch = (f) => f(defaultDatastruct);
defaultDatastruct = {data:{}, batch};

export default class Database{
  constructor(datastruct = defaultDatastruct){
    this._datastruct = datastruct;
    this._data = datastruct.data;
    this.Entities = {};
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
