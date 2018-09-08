import DataStruct, {merger} from '../index';
import { assert, expect } from 'chai';

describe('merger', () => {
  describe('#initialization', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    let data = obj.data;
    data.b = 3;
    data.b = 4;
    data.b = 5;
    const jsdump = obj.toJS();
    const reset = (what = obj) => {
      obj.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.IMMEDIATE;
      what.fromJS(jsdump);
    };

    it('must_commited', () => {
      obj.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.NEVER;
      data.b = 8;

      expect(() => {
        merger(obj, {});
      }).to.throw();
    });


    it('single_commits', () => {
      reset();
      let obj2 = new DataStruct();
      let data2 = obj2.data;
      let startuuid = obj.transactionUuid;
      reset(obj2);
      data.b = 6;
      data.b = 7;

      const changes = obj.toJS(startuuid).changes;
      const last2_commit = changes[changes.length-2];
      const last_commit = changes[changes.length-1];

      assert(data2.b === 5);

      assert(last2_commit.srcuuid === obj2.transactionUuid);
      merger(obj2, last2_commit);
      assert(data2.b === 6);
      assert(obj2.transactionUuid === last2_commit.uuid);

      assert(last_commit.srcuuid === obj2.transactionUuid);
      merger(obj2, last_commit);
      assert(data2.b === 7);
      assert(obj2.transactionUuid === last_commit.uuid);
    });

    it('commit_insert', () => {
      reset();
      let obj2 = new DataStruct();
      let data2 = obj2.data;
      let startuuid = obj.transactionUuid;
      reset(obj2);
      data.b = 6;
      data.b = 7;
      data2.c = -1;

      const lasttransactionuuid = obj2.transactionUuid;

      const changes = obj.toJS(startuuid).changes;
      const last2_commit = changes[changes.length-2];
      merger(obj2, last2_commit);
      assert(data2.b === 6);
      assert(data2.c === -1);
      assert(obj2.transactionUuid === lasttransactionuuid);
    });

    it('commit_insert', () => {
      reset();
      let obj2 = new DataStruct();
      let data2 = obj2.data;
      let startuuid = obj.transactionUuid;
      reset(obj2);
      data.b = 6;
      data.b = 7;
      data2.c = -1;

      const lasttransactionuuid = obj2.transactionUuid;
      const changes = obj.toJS(startuuid).changes;
      const last2_commit = changes[changes.length-2];
      merger(obj2, last2_commit);
      assert(data2.b === 6);
      assert(data2.c === -1);
      assert(obj2.transactionUuid === lasttransactionuuid);
    });

    it('commit_insert', () => {
      reset();
      let obj2 = new DataStruct();
      let data2 = obj2.data;
      let startuuid = obj.transactionUuid;
      reset(obj2);
      data.b = 6;
      data.b = 7;
      data2.c = -1;
    });

  });

  describe('#merger_subscribtions', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    obj.AUTOCOMMIT_STRATEGY = DataStruct.AUTOCOMMIT_STRATEGIES.IMMEDIATE; //when this would work, the others would also work
    let data = obj.data, subscriber = (e)=>mychanges.push(e);
    let mychanges = [];
    obj.subscribe(subscriber);


    let obj2 = DataStruct.from(obj), subscriber2 = (e)=>mychanges2.push(e);;
    let mychanges2 = [];
    obj2.subscribe(subscriber2);


    //prepare commits
    data.a = 3;
    data.b = 4;
    data.c = 5;

    it('skipSome', () => {
      //check empty
      expect(mychanges.length).to.eq(3);
      expect(mychanges2.length).to.eq(0);

      let withoutFirst = new Set([subscriber]);
      mychanges.filter(e=>e.type==='commit').forEach(({data}) => {
        merger(obj2, data, {skipSubscribers: withoutFirst});
      });

      expect(mychanges.filter(e=>e.type !== 'commit')).to.be.empty;


      expect(mychanges.length).to.eq(3);
      expect(mychanges2.length).to.eq(3);
    });

  });
});
