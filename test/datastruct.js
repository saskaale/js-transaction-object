import assert from 'assert';
import DataStruct from '../src/datastruct';

describe('DataStruct', () => {
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

  describe('#update', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    let data = obj.data;

    it('check', () => {
      assert(data.a !== 1);
      data.a = 1;
      assert(data.a === 1);
    });
  });

  describe('#transactions', () => {
    it('nocommit_default', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      let data = obj.data;
      let version = obj.data;

      let initTransactionId = obj.transactionUuid;
      //AUTOCOMMIT_STRATEGY
      data.a = 1;
      obj.rollback();

      assert(data.a === 1);
      assert(obj.transactionUuid !== initTransactionId);
    });

    it('rollback_to_current', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      let data = obj.data;

      let initTransactionId = obj.transactionUuid;

      obj.begin();
      data.a = 1;
      obj.rollback();

      //rollback the change so the object contains the initial values
      assert(obj.transactionUuid === initTransactionId);
      assert(data.a !== 1);
      assert(data.a.a1 == 1);
    });

    it('rollback_to_specific', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      let data = obj.data;

      data.b = 3;
      let uuid = obj.transactionUuid;
      data.a = 1;
      assert(obj.transactionUuid !== uuid);
      obj.rollback(uuid);

      //rollback the change so the object contains the initial values
      assert(obj.transactionUuid === uuid);
      assert(data.a !== 1);
      assert(data.a.a1 == 1);
    });

  });


});
