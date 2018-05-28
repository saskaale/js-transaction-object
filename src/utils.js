class Utils{
    addType(Type, cloningFunc){
        Utils.classes.push([Type, cloningFunc]);
    }
    static map(obj, fun){
      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" != typeof obj) return obj;
      const funHandler = Utils.classes.find(([Type]) => obj instanceof Type);
      if(funHandler && funHandler[2])
          return funHandler[2](obj, fun);

      return obj;
    }
    static clone(deep) {
        let inside = deep ? clone : (e => e);
        let copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        const funHandler = clonings.find(([Type]) => obj instanceof Type);
        if(funHandler)
            return funHandler[1](obj);

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
}

Utils.classes = [
  [Date,(obj) => {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
  }],
  [Array,(obj) => {
      copy = [];
      copy.length = obj.length;
      for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = inside(obj[i]);
      }
      return copy;
  },(obj, fun) =>
    obj.map(fun)
  ],
  [Object,(obj) => {
      copy = {};
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = inside(obj[attr]);
      }
      return copy;
  },(obj, fun) => {
    let n = {};
    for(let k in obj){
      n[k] = fun(obj[k], k);
    }
    return n;
  }]
];

export default Utils;
