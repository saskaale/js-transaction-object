import {TinySeq} from '../utils';
import ListenDatastruct from './behaviors/listenDatastruct';
import Entity from './entity';

const Database =  ListenDatastruct(class{
  constructor(){
    this.Entities = {};
    this._data = {};
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
});

export default Database;

const createDatabase = (name) => {
    const cl = class extends Database{};
    cl.className = name;
    return cl;
}

export {createDatabase}
