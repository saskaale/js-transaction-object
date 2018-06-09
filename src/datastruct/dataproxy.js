import {fromJS} from 'immutable';
import {isImmutable} from './utils';

var proxySet = new WeakMap();

function dataproxy(source, path){
  let manager = {
    get: (_, prop) => {
      let d = source._immutable.getIn(path).get(prop);
      if(d && isImmutable(d))
        return dataproxy(source, [...path,prop]);
      return d;
    },
    set: (_, prop, v) => {
      if(proxySet.has(v)){
        const proxyprop = proxySet.get(v);
        v = proxyprop.source._immutable.getIn(proxyprop.path);
      }else if(v && (v === Object(v))){
        v = fromJS(v);
      }
      source._autobegin();
      source._immutable = source._immutable.setIn([...path,prop], v);
      source._autocommit();
      return true;
    },
    deleteProperty: (_, prop) => {
      source._autobegin();
      source._immutable = source._immutable.removeIn([...path,prop]);
      source._autocommit();
      return true;
    },
    ownKeys: (_, prop) => {
      const [ ...keys ] = source._immutable.getIn(path).keys();
      return keys;
    },
    has: (_, prop) =>
      source._immutable.hasIn([...path,prop])
  };

  const d = {source, path};
  const proxy = new Proxy(d, manager);
  proxySet.set(proxy, d);
  return proxy;
};

export default dataproxy;
