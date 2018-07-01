import {TinySeq} from '../utils';
import Entity from './entity';

export default class Database{
  constructor(datastruct = {data:{}}){
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
