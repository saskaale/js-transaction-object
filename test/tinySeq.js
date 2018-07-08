import {TinySeq} from '../src/utils';
import { assert, expect } from 'chai';

describe('TinySeq', () => {
  describe('#basics', () => {
    it("arrInit", () => {
        expect(TinySeq([1,{a:1,b:2},3]).toArray())
            .to.deep.equal([1,{a:1,b:2},3]);
    });
    it("objInit", () => {
        expect(TinySeq({a:1,b:{a:1,b:2},c:3}).toObject())
            .to.deep.equal({a:1,b:{a:1,b:2},c:3});
    });
    it("arrToObj", () => {
        expect(TinySeq([1,{a:1,b:2},3]).toObject())
            .to.deep.equal({'0':1,'1':{a:1,b:2},'2':3});
    });
    it("objToArr", () => {
        expect(TinySeq({'0':1,'1':{a:1,b:2},'2':3}).toArray())
            .to.deep.equal([1,{a:1,b:2},3]);
    });
    it("tinySeqInit", () => {
        expect(TinySeq(TinySeq({a:1,b:3,d:{a:1,b:2}})
            .map(e=>typeof e === 'number' ? e*2 : e))
            .toArray())
            .to.deep.equal([2,6,{a:1,b:2}]);
    });
  });

  describe('#indexed', () => {
    it("arr", () => {
        const data = [1,2,3];
        expect(TinySeq(data).isIndexed())
            .to.equal(true);
        expect(TinySeq(data).isKeyed())
            .to.equal(false);
    });
    it("obj", () => {
        const data = {'a': 0, 'c': 1, 'd': 2};
        expect(TinySeq(data).isIndexed())
            .to.equal(false);
        expect(TinySeq(data).isKeyed())
            .to.equal(true);
    });
  });

  describe('#mapForeach', () => {
    it("arrMap", () => {
        expect(TinySeq([1,{a:1,b:2},3])
            .map((e, k)=>[k, typeof e === 'number' ? e*2 : e])
            .toArray())
            .to.deep.equal([[0,2],[1,{a:1,b:2}],[2,6]]);
    });
    it("objMap", () => {
        expect(TinySeq({a:1,d:{a:1,b:2},b:3})
            .map((e, k)=>[k, typeof e === 'number' ? e*2 : e])
            .toObject())
            .to.deep.equal({a:['a', 2],b:['b', 6],d:['d', {a:1,b:2}]});
    });

    it("objForeach", () => {
        let data = {a:1,d:{a:1,b:2},c:3};
        let keys = [];
        let values = [];
        TinySeq(data).forEach((v,k) => {
            keys.push(k);
            values.push(v);
        });
        expect(keys).to.deep.equal(Object.keys(data));
        expect(values).to.deep.equal(Object.values(data));
    });
    it("arrForeach", () => {
        let data = [1,{a:1,b:2},3];
        let keys = [];
        let values = [];
        TinySeq(data).forEach((v,k) => {
            keys.push(k);
            values.push(v);
        });
        expect(values).to.deep.equal(data);
        expect(keys).to.deep.equal([0,1,2]);
    });
  });

  describe('#advanced', () => {
    it("mapValues", () => {
        expect(TinySeq([4,7,10]).mapValues(([k,v]) => ([k*2, v*3])).toObject())
            .deep.to.equal({'0':12, '2':21, '4': 30});
    });
});

});