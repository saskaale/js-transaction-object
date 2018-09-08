import DataStruct from '../src/datastruct';
import { assert, expect } from 'chai';

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

  describe('#delete', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    let data = obj.data;

    it('check', () => {
      assert(data.a !== 1);
      assert(data.a.a1 === 1);
      delete data.a;
      assert(data.a === undefined);
    });
  });

  describe('#transactions', () => {
    it('nocommit_default', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      let data = obj.data;
      let version = obj.data;

      let initTransactionId = obj.transactionUuid;
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

    it('rollback_to_nonpecified', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      let data = obj.data;
      data.b = 3;

      expect(() => {
        obj.rollback("13123bcsasdas");  //some most likely never shit
      }).to.throw();
    });

    it('setting_of_object', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      let data = obj.data;

      data.b = data.a;
      assert(data.b !== 2);
      assert(data.a.a1 === data.b.a1);
    });

    it('commited', () => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      obj.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.NEVER;
      let data = obj.data;

      let uuid = obj.transactionUuid;

      assert(obj.commited);
      data.a = 1;
      assert(data.a === 1);
      assert(!obj.commited);
      obj.commit();
      assert(obj.commited);
    });
  });

  describe('#commit_strategies', () => {
    it('never_strategy', (done) => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      obj.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.NEVER;
      let data = obj.data;

      let uuid = obj.transactionUuid;

      assert(obj.commited);
      data.a = 1;

      assert(data.a === 1);
      assert(!obj.commited);

      setTimeout(() => {
        assert(data.a === 1);
        assert(!obj.commited);
        obj.commit();
        assert(data.a === 1);
        assert(obj.commited);
        done();
      },50);
    });

    it('async_strategy', (done) => {
      let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
      obj.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.ASYNC;
      let data = obj.data;

      let uuid = obj.transactionUuid;
      data.a = 1;
      assert(!obj.commited)
      assert(data.a === 1);

      setTimeout(() => {
        assert(data.a === 1);
        assert(obj.commited);
        done();
      },50);
    });
  });

  describe('#subscribtions', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    let data = obj.data;
    const startuuid = obj.transactionUuid;

    let mychanges = [];
    obj.subscribe((e)=>mychanges.push(e));

    data.b = 3;
    data.b = 4;

    assert(mychanges.length === 2);
    const objdump = obj.toJS(startuuid);

    expect(objdump.changes).to.deep.equal(
        mychanges.filter(e=>e.type ==='commit').map(e => e.data)
    );

    expect(mychanges.filter(e=>e.type !=='commit')).to.be.empty;
  });
});
