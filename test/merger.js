import assert from 'assert';
import DataStruct, {merger} from '../index';

describe('merger', () => {
  describe('#initialization', () => {
    let obj = new DataStruct({a:{a1:1,a2:1.2},b:2});
    let data = obj.data;
    data.b = 3;
    data.b = 4;
    data.b = 5;
    const jsdump = obj.toJS();
    const reset = (what = obj) => {
      what.fromJS(jsdump);
    };

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

  });
});
