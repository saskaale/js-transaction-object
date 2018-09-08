import {TinySeq} from '../utils';
import ListenDatastruct from './behaviors/listenDatastruct';
import Entity from './entity';

const Database =  ListenDatastruct(class{
  constructor(){
    this.Entities = {};
    this._data = {};
    this._version = 0;
  }

  genVersion(){
    return this._version++;
  }

  _createData(Entity, uuid){
    if(this._data[Entity] === undefined)
      this._data[Entity] = {};
    if(this._data[Entity][uuid] === undefined)
      this._data[Entity][uuid] = {};
    return this._data[Entity][uuid];
  }

  _add(entity){
    this[entity.className][entity.uuid] = entity;
  }

  _delete(entity){

    if(
      this[entity.className]
      &&
      this[entity.className][entity.uuid]
    ){
      delete this[entity.className][entity.uuid];
    }
    if(
      this._data[entity.className] 
      && 
      this._data[entity.className][entity.uuid]
    ){
      delete this._data[entity.className][entity.uuid];
    }
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
