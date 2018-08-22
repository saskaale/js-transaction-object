import TinySeq, {isObject, isSeq} from './tinySeq';

function enchanceKey(obj, k, defaultVal){
  return TinySeq(obj).map(e => {
    if(isObject(e))
      return e;
    if(k)
      return {[k]:e};
    return {};
  }).toObject();
}

function defaultKey(obj, k, val){
  TinySeq(obj).forEach(e => {
    e[k] = e[k] || val;
    return e;
  });
  return obj;
}

function one2Arr(k){
  return isArray(k) ? k : [k];
}

function extend(o = {}){
  for(let i = 1; i < arguments.length; i++){
    let tomerge = arguments[i];
    for(let k in tomerge)
      o[k] = tomerge[k];
  }
  return o;
}

export {TinySeq, isSeq, enchanceKey, defaultKey, one2Arr, extend}
