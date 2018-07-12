import DataStruct from '../../datastruct';
import {TinySeq} from '../../utils';

let defaultDatastruct;
let batch = (f) => f(defaultDatastruct);
defaultDatastruct = {
      batch,
      begin(){},
      commit(){},
      subscribe(){ return () => {}; }
};

export default (parent) => class extends parent{
  constructor(datastruct = defaultDatastruct){
    super(datastruct);

    datastruct.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.ASYNC;
    datastruct.subscribe(this._listenDataChange.bind(this));

    this._datastruct = datastruct;
    if(datastruct.data)
      this._data = datastruct.data;
  }
  _listenDataChange({diff}){
    const doRemove = (path, addStep = 0) => {
      if(addStep <= 0){
        if(path.length > 1){
          const entity = this[path[0]][path[1]];
          if(entity){
            if(path.length > 2)
              delete entity[path[2]];
            else
              entity.delete();
          }
        }else{
          TinySeq(this[path[0]]).forEach(e=>e.delete());
        }
      }
    }

    const valuesForStep = (entityName, values, addStep) => {
      const Entity = this.Entities[entityName];
      return TinySeq(values).filter((_,k) => {
        if(addStep <= 0)
          return Entity.prototype._regPropDef[k];
        return Entity.prototype._refPropDefId[k];
      }).toObject();
    }

    const upsertEntity = (entityName, uuid, values, addStep) => {
      const entity = this[entityName][uuid];
      values = valuesForStep(entityName, values, addStep);
      if(addStep <= 0 && !entity){
        const Entity = this.Entities[entityName];
        new Entity(values);
      }else{
        entity._update(values);
      }
    }

    const doUpsert = (path, value, addStep) => {
      if(path.length > 1){
        if(path.length > 2)
          value = {[path[2]]:value};
        upsertEntity(path[0], path[1], value, addStep);
      }else{
        TinySeq(value).forEach((entityValue, entityId)=>{
          upsertEntity(path[0], entityId, entityValue, addStep);
        });
      }
    }

    /*
     * Add steps
     */
    for(let addStep = 0; addStep < 2; addStep++){ //phases
      diff.forEach(diffEl => {
        let {op, path, value} = diffEl;
        path = path.substr(1).split('/');
        switch(op){
          case 'add':
            doUpsert(path, value, addStep);
            break;
          case 'replace':
            doUpsert(path, value, addStep);
            break;
          case 'remove':
            doRemove(path, addStep);
            break;
        }
      });
    }
  }
};
