import assert from 'assert';
import DataStruct from '../index';

describe('serialization', () => {
  describe('#basic', () => {
    const obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    const obj2 = new DataStruct({a:3,b:2});
    const data = obj.data;
    const data2 = obj2.data;


    it('init', () => {
      assert(obj.transactionUuid !== obj2.transactionUuid);
      assert(data.a !== data2.a);
    });

    it('change', () => {
      obj2.fromJS(obj.toJS());
      assert(obj.transactionUuid === obj2.transactionUuid);
      assert(data2.a !== undefined);
      assert(data2.a !== 3);
      assert(data2.a.a1 === 1);
    });
  });

  describe('#transactions', () => {
    const obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    const obj2 = new DataStruct({a:3,b:4});
    const data = obj.data;
    const data2 = obj2.data;
    let startuuid = obj.transactionUuid;
    data.b = 3;

    it('init', () => {
      obj2.fromJS(obj.toJS());  //so now they are identical
      assert(obj.transactionUuid === obj2.transactionUuid);
      assert(data.b === data2.b);
      assert(data2.b === 3);
    });

    it('history', () => {
      obj2.fromJS(obj.toJS(startuuid));  //so now they are identical
      assert(obj.transactionUuid === obj2.transactionUuid);
      assert(data.b === data2.b);
      assert(data2.b === 3);
    });

    it('history_rollback', () => {
      obj2.fromJS(obj.toJS(startuuid));  //so now they are identical
      obj2.rollback(startuuid);
      assert(obj2.transactionUuid === startuuid);
      assert(data.b !== data2.b);
      assert(data2.b === 2);
    });

  });

});
