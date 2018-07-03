import {TinySeq, enchanceKey, defaultKey, one2arr, extend} from '../utils';
import uuidv1 from 'uuid/v1';

const defaultProperties = {uuid: {update: () => {throw new Error("You cannot set id on entity");}}};

const deletedGetSet = () => {throw new Error('This object was deleted')};

export default class Entity{
  static init(db, entity, properties = {}, navigation = {}){
    entity.prototype._propDef = extend({}, properties, defaultProperties);
    entity.prototype._navDef = extend({}, navigation);
    entity.prototype._db = db;
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
    const initProperty = ({set, get}, k) => {
      Object.defineProperty(entity.prototype,
        k,
        {
          get,
          enumerable: () => true,
          configurable: true,
          set,
        });
    };

    const beforeSet = function({update}, k, v){
      let oldVal = this[k];
      if(v !== oldVal && oldVal !== undefined && update){
        v = update(this,v);
      }
      return v;
    };

    const buildReference = (property, k) => ({
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
        this._ref[k] = v;
        v.addRef(property.ref, this);
        return true;
      },
      get: function(){
        return this._ref[k];
      }
    });

    const buildProperty = (property, k) => ({
      set: function(v){
        v = beforeSet.call(this, property, k, v);
        this._data[k] = v;
        return true;
      },
      get: function(){
        return this._data[k];
      }
    });

    /*
     * Build property descriptors
     */
    entity.prototype._propDef = enchanceKey(entity.prototype._propDef);
    //properties which are references
    entity.prototype._refPropDef = TinySeq(entity.prototype._propDef)
      .filter(({ref})=>ref).toObject();
    //properties which are regular values
    entity.prototype._regPropDef = TinySeq(entity.prototype._propDef)
        .filter(({ref})=>!ref).toObject();
    //init the property descriptors
    TinySeq(entity.prototype._refPropDef)
      .forEach((p, k) => initProperty(buildReference(p,k), k));
    TinySeq(entity.prototype._regPropDef)
      .forEach((p, k) => initProperty(buildProperty(p,k), k));


    /*
     * Build navigation property descriptors
     */
    entity.prototype._navDef = enchanceKey(entity.prototype._navDef, 'nullable');
    defaultKey(entity.prototype._navDef, 'source', 'uuid');
    TinySeq(entity.prototype._navDef).forEach((_, k) => {
      initProperty({
        get: function(){return this._navigation[k];},
        set: function(v){
          this.addRef(k, v);
          return true;
        }
      }, k);
    });
  }

  constructor(data = {}){
    this._ref = {};
    this._data = {};
    this._navigation = TinySeq(this._navDef).map(_=>({})).toObject();
    this._create(data);
  }

  _newUuid(){
    return uuidv1();
  }

  delete(){
    this._db._delete(this);

    /*
      TODO: refractor this
        - create a lot of GC garbage
        - can cause potential performance issues
    */
    const deleteProperty = (_, k) => {
      Object.defineProperty(this,
        k,
        {
          get: deletedGetSet,
          set: deletedGetSet,
          enumerable: () => true ,
        });
    };
    TinySeq(this._navDef).forEach(deleteProperty);
    TinySeq(this._propDef).forEach(deleteProperty);
  }

  _update(data){
    TinySeq(data).filter((e,k)=>!this._propDef[k].ref).forEach((v,k) => this[k] = v);
    TinySeq(data).filter((e,k)=>this._propDef[k].ref).forEach((v,k) => this[k] = v);
  }

  _create(data){
    data.uuid = data.uuid || this._newUuid();
    this._data = this._db._createData(this.className, data.uuid, data.uuid);
    this._update(data);
    this._db._add(this);
  }
};

let createEntity = (name, db, properties = {}, navigation = {}, cl = undefined) => {
  if(cl === undefined)
    cl = class extends Entity{};
  if(!cl.prototype instanceof Entity){
    throw new Error("class must inherits the Entity");
  }
  cl.prototype.className = name;
  db.initEntity(cl, properties, navigation);
  return cl;
}

export {createEntity};
