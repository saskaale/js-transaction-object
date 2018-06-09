import assert from 'assert';
import DataStruct, {merger} from '../index';

describe('merger', () => {
  describe('#initialization', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    let data = obj.data;

    it('check for present data', () => {
      assert(data.b === 2);
      assert(data.c === undefined);
    });

    it('check for present nested a', () => {
      assert(data.a !== undefined);
      assert(data.a.a1 === 1);
    });
  });
});
