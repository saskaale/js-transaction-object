import {TinySeq, enchanceKey, defaultKey, one2arr, extend} from '../utils';
import uuidv1 from 'uuid/v1';

const defaultProperties = {uuid: {update: () => {throw new Error("You cannot set id on entity");}}};

export default class Entity{
  static init(db, entity, properties = {}, navigation = {}){
    entity.prototype._propDef = extend({}, properties, defaultProperties);
    entity.prototype._navDef = extend({}, navigation);
  }

  deleteRef(k, entity){
    const key = this._navDef[k].source;
    delete this._navigation[k][entity[key]];
  }

  addRef(k, entity){
    const key = this._navDef[k].source;
    this._navigation[k][entity[key]] = entity;
  }

  static build(entity, db){
    let beforeSet = function({update}, k, v){
      let oldVal = this[k];
      if(v !== oldVal && oldVal !== undefined && update){
        v = update(this,v);
      }
      return v;
    }

    let buildReference = (property, k) => {
      return {
        set: function(v){
          v = beforeSet.call(this, property, k, v);
          if(this[k] && (this[k] instanceof Entity)){
            this[k].deleteRef(k, this);
          }
          if(v !== undefined){
            if(property.type && !(v instanceof db.Entities[property.type]))
              throw new Error("db "+db.className+": "+entity.className+"["+k+"] can be only intanceof "+property.type);
          }
          this._data[k+'Id'] = v.uuid;
          v.addRef(property.ref, this);
          return true;
        },
        get: function(){
          let entityId = this._data[k+'Id'];
          return db[property.type][entityId];
        }
      };
    };

    entity.prototype._propDef = enchanceKey(entity.prototype._propDef);
    TinySeq(entity.prototype._propDef).forEach((property, k) => {
        let set, get;
        if(property.ref){
          property.ref = property.ref || {};
          const ref = buildReference(property, k);
          set = ref.set;
          get = ref.get;
        }else{
          set = function(v){
            v = beforeSet.call(this, property, k, v);
            this._data[k] = v;
            return true;
          };
          get = function(){
            return this._data[k];
          };
        }

        Object.defineProperty(entity.prototype,
          k,
          {
            get,
            enumerable: () => true ,
            set,
          });
    });


    entity.prototype._navDef = enchanceKey(entity.prototype._navDef, 'nullable');
    defaultKey(entity.prototype._navDef, 'source', 'uuid');
    TinySeq(entity.prototype._navDef).forEach((property, k) => {
      Object.defineProperty(entity.prototype,
        property,
        {
          get: function(){return this._navigation[k] || {};},
          enumerable: () => true ,
          set: function(v){
            this.addRef(k, v);
            return true;
          }
        });
    });
  }

  constructor(data = {}){
    this._data = {};
    this._navigation = TinySeq(this._navDef).map(_=>({})).toObject();
    this._create(data);
  }

  _newUuid(){
    return uuidv1();
  }

  _delete(){

  }

  _update(data){
    TinySeq(data).filter((e,k)=>!this._propDef[k].ref).forEach((v,k) => this[k] = v);
    TinySeq(data).filter((e,k)=>this._propDef[k].ref).forEach((v,k) => this[k] = v);
  }

  _create(data){
    data.uuid = data.uuid || this._newUuid();
    this._update(data);
  }

};

let createEntity = (name, db, properties = {}, navigation = {}) => {
  let cl = class extends Entity{};
  cl.prototype.className = name;
  db.initEntity(cl, properties, navigation);
  return cl;
}

export {createEntity};
