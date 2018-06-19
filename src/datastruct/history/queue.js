export default class DEQueue{
  constructor(d = []){
    this._data = [...d];
  }
  append(record) {
    this._data.push(record);
  }
  prepend(record) {
    this._data.unshift(record);
  }
  first() {
    return this._data[0];
  }
  last() {
    return this._data[this._data.length-1];
  }
  pop_last(){
    return this._data.pop();
  }
  pop_first(){
    return this._data.shift();
  }
  get length(){
    return this._data.length;
  }
  cutEnd(i){
    this._data.length = i+1;
  }
  nth(n){
    return this._data[n];
  }
  *beginEnd(){
    for(let i = this._data.length-1; i >= 0; i--)
      yield [i, this._data[i]];
  }
}
