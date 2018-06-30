function isObject(v){
      return v !== null
            && typeof v === 'object'
            && Array.isArray(v) === false;
};

function TinySeq(_d){

  const _isObject = () => {
    return isObject(_d);
  }

  const _isArray = () => {
    return Array.isArray(_d);
  }

  const forEach = (f) => {
    map(f);
  }

  const first = () => {
    if(_isArray()){
      return _d[0];
    }else if(_isObject()){
      //object
      for(let k in _d){
        return _d[k];
      }
      return undefined;
    }

    throw new Error('Unreachable');
  }

  const mapFilter = (map, filter) => {
    if(_isArray()){
      //array
      let arr = _d;
      if(filter)
        arr = arr.filter(filter);
      if(map)
      arr = arr.map(map);
      return TinySeq(arr);
    }else if(_isObject()){
      //object
      let r = {};
      for(let k in _d){
        if(filter && !filter(_d[k], k, _d))
          continue;
        r[k] = map ? map(_d[k], k, _d) : _d[k];
      }
      return TinySeq(r);
    }
    throw new Error('Unreachable');
  }

  const filter = (f) => {
    return mapFilter(undefined, f);
  }

  const map = (f) => {
    return mapFilter(f);
  }

  const toObject = () => {
    if(_isObject()){
      return _d;
    }
    let r = {};
    forEach((v,k) => {
      r[k] = v;
    });
    return r;
  }

  const toArray = () => {
    if(isArray()){
      return _d;
    }else if(isObject()){
      return Object.values(_d);
    }
    throw new Error('Unreachable');
  }

  const toKeyed = () => {
    return TinySeq(toObject());
  }

  const toIndexed = () => {
    return TinySeq(toArray());
  }

  return {
    toKeyed,
    toIndexed,
    forEach,
    first,
    map,
    filter,
    toArray,
    toObject,
  };
}

export default TinySeq;
export {isObject};
