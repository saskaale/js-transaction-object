import {TinySeq} from '../utils';
import Entity from './entity';

export default class Database{
  constructor(){
    this.Entities = {};
  }

  add(entity){
    this[entity.className][entity.id] = entity;
  }

  build(){
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
