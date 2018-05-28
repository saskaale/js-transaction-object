import {Map, List, fromJS} from 'immutable';

let isImmutable = (e) => e instanceof Map || e instanceof List;

function dataproxy(source, path){
  let manager = {
    get: (source, prop) => {
      let d = source._immutable.getIn(path).get(prop);
      if(d && isImmutable(d))
        return dataproxy(source, [...path,prop]);
      return d;
    },
    set: (source, prop, v) => {
      if(v && (v === Object(v)))
        v = fromJS(o);
      source._autobegin();
      source._immutable = source._immutable.setIn([...path,prop], v);
      source._autocommit();
      return true;
    },
    deleteProperty: (source, prop) => {
      source._autobegin();
      source._immutable = source._immutable.removeIn([...path,prop]);
      source._autocommit();
    },
    ownKeys: (source, prop) => {
      const [ ...keys ] = source._immutable.getIn(path).keys();
      return keys;
    },
    has: (source, prop) =>
      source._immutable.hasIn([...path,prop])
  };

  return new Proxy(source, manager);
};

export default dataproxy;
