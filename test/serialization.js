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
    data.b = 3;
    obj2.fromJS(obj.toJS());  //so now they are identical

    it('init', () => {
      assert(obj.transactionUuid === obj2.transactionUuid);
      assert(data.b === data2.b);
      assert(data2.b === 3);
    });

  });

});
