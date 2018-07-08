function isObject(v){
      return v !== null
            && typeof v === 'object'
            && Array.isArray(v) === false;
};

function TinySeq(_d){
  //so we can chain TinySeq
  if(_d && _d.toRaw)
    _d = _d.toRaw();

  const _isObject = () => isObject(_d);
  const _isArray = () => Array.isArray(_d);
  const forEach = (f) => { map(f); };

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

  const filter = (f) => mapFilter(undefined, f);
  const map = (f) => mapFilter(f);
  const toKeyed = () => TinySeq(toObject());
  const toIndexed = () => TinySeq(toArray());
  const isKeyed = _isObject;
  const isIndexed = _isArray;
  const toRaw = () => _d;
  const mapValues = (f) => {
    let ret = {};
    forEach((v, k) => {
      let [newk, newv] = f([k,v]);
      ret[newk] = newv;
    });
    return TinySeq(ret);
  }

  const concat = () => {
    let args = args.map(e=>TinySeq(e));
    let indexed = args.reduce(
        (prev, cur) => prev && cur.isIndexed(),
        isIndexed()
      );
    if(isIndexed){
      let d = toArray();
      args.forEach(e => {
        d = d.concat(e.toArray());
      });
      return TinySeq(d);
    }else{
      const addEls = (e,k) => {d[k] = e;};
      let d = {};
      forEach(addEls);
      args.forEach(addEls);
      return TinySeq(d);
    }
  }

  return {
    toKeyed,
    toIndexed,
    forEach,
    first,
    map,
    mapValues,
    concat,
    isKeyed,
    toRaw,
    filter,
    toArray,
    toObject,
  };
}

export default TinySeq;
export {isObject};
