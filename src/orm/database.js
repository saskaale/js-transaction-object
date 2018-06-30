import {TinySeq} from '../utils';
import Entity from './entity';

export default class Database{
  constructor(datastruct = {}){
    this._datastruct = datastruct;
    this.Entities = {};
  }

  _add(entity){
    this[entity.className][entity.uuid] = entity;
  }

  _delete(entity){
    delete this[entity.className][entity.uuid];
  }

  build(){
    TinySeq(this.Entities).forEach((Entity) => {
      if(this._datastruct[Entity] === undefined)
        this._datastruct[Entity] = {};
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
