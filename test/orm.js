import { assert, expect } from 'chai';

import DataStruct from '../src/datastruct';
import {createDatabase, createEntity, Entity, Database} from '../src/orm';
import {TinySeq} from '../src/utils';

describe('ORM', () => {
  const initDb = (datastruct, entities = {}) => {
    const MyDb = createDatabase('MyDb');
    const db = new MyDb(datastruct);
    const Task = createEntity('Task', db, {
                  name: null,
                  description: null
                }, {
                  subtasks: null,
                  subsubtasks: null
                },
                entities.Task);
    const SubTask = createEntity('SubTask', db, {
                  task: {type:'Task', ref: 'subtasks'},
                  name: null,
                  description: null,
                  priority: null
                }, {
                  subsubtasks: null
                },
                entities.SubTask);
    const SubSubTask = createEntity('SubSubTask', db, {
                  subtask: {type:'SubTask', ref: 'subsubtasks'},
                  name: null
                },
                {},
                entities.SubSubTask);
    db.build();

    return {db, Task, SubTask, SubSubTask, MyDb};
  }

  const initSyncThroughDataStruct = () => {
    const ds = new DataStruct();
    const {db: dbemitter, Task, SubTask, SubSubTask} = initDb(ds);
    const {db: dblistener} = initDb(ds);

    const objTo = (el) => {
      const mapValue = (value) => 
        (value && value instanceof Entity) ? value.uuid : value;

      return TinySeq(el.Entities).map((e, k) => 
        TinySeq(el[k]).map(e=>
          TinySeq(e._propDef).map((_,k) => 
            mapValue(e[k])
          ).toObject()
        ).toObject()
      ).toObject();
    }

    const test = (msg) => {
      it(msg, () => {
        let oemitter = objTo(dbemitter);
        let oelistener = objTo(dblistener);

        expect(oelistener).to.deep.equal(oemitter);
      });
    }

    return {
      dbemitter, 
      dblistener, 
      commit: ds.commit.bind(ds), 
      test,
      Task, 
      SubTask, 
      SubSubTask 
    };
  }


  describe('#basic', () => {
    const {db, Task, SubTask} = initDb();
    const task1 = new Task({name: 'task1'});
    const task1_2 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1});

    it('structure', () => {
      assert(db instanceof Database);
      assert(task1 instanceof Entity);
      expect(Object.keys(db.Entities).sort((v1,v2) => v1.localeCompare(v2)))
        .to.deep.equal(['SubSubTask', 'SubTask', 'Task']);
    });

    it('values', () => {
      assert(task1.uuid !== undefined);
      assert(task1_2.uuid !== task1.uuid);
      assert(task1_2.uuid !== task2.uuid);
      assert(task1.name === 'task1');
      assert(task1_2.name === 'task1');
      assert(task2.name === 'task2');
      assert(subtask1.name === 'subtask1');
    });

    it('foreign_keys', () => {
      expect(task1.subtasks).to.deep.equal({[subtask1.uuid]:subtask1});
    });
  });

  describe('#advanced', () => {
    const {db, Task, SubSubTask, SubTask} = initDb();
    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1});
    const subtask2 = new SubTask({name: 'subtask2', task: task1});
    const subtask3 = new SubTask({name: 'subtask2', task: task1});
    const subsubtask2_1 = new SubSubTask({name: 'subsubtask2_1', subtask: subtask2});
    const subsubtask2_2 = new SubSubTask({name: 'subsubtask2_2', subtask: subtask2});
    const subsubtask1_1 = new SubSubTask({name: 'subsubtask1_1', subtask: subtask1});

    it('nesting', () => {
      expect(subtask1.subsubtasks).to.deep.equal({[subsubtask1_1.uuid]:subsubtask1_1});
      expect(subtask2.subsubtasks).to.deep.equal({[subsubtask2_1.uuid]:subsubtask2_1, [subsubtask2_2.uuid]:subsubtask2_2});
      expect(subtask3.subsubtasks).to.deep.equal({});
    });
  });

  describe('#public_access', () => {
    const {db, Task, SubSubTask, SubTask} = initDb();
    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1});
    const subtask2 = new SubTask({name: 'subtask2', task: task1});
    const subtask3 = new SubTask({name: 'subtask2', task: task1});
    const subsubtask2_1 = new SubSubTask({name: 'subsubtask2_1', subtask: subtask2});
    const subsubtask2_2 = new SubSubTask({name: 'subsubtask2_2', subtask: subtask2});
    const subsubtask1_1 = new SubSubTask({name: 'subsubtask1_1', subtask: subtask1});

    it('Task', () => {
      expect(db).to.deep.include({
        Task:{
          [task1.uuid]: task1,
          [task2.uuid]: task2,
        }
      });
    });

    it('SubTask', () => {
      expect(db).to.deep.include({
        SubTask:{
          [subtask1.uuid]: subtask1,
          [subtask2.uuid]: subtask2,
          [subtask3.uuid]: subtask3,
        }
      });
    });

    it('SubSubTask', () => {
      expect(db).to.deep.include({
        SubSubTask:{
          [subsubtask2_1.uuid]: subsubtask2_1,
          [subsubtask2_2.uuid]: subsubtask2_2,
          [subsubtask1_1.uuid]: subsubtask1_1,
        }
      });
    });

  });

  describe('#datastruct', () => {
    const datastruct = new DataStruct();
    const {db, Task, SubSubTask, SubTask} = initDb(datastruct);

    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1});
    const subtask2 = new SubTask({name: 'subtask2', task: task1});
    const subtask3 = new SubTask({name: 'subtask3', task: task1});

    it('test', () => {
      expect(datastruct.immutable.toJS()).to.deep.equal({
        'Task': {
          [task1.uuid]:{
            uuid: task1.uuid,
            name: 'task1'
          },
          [task2.uuid]:{
            uuid: task2.uuid,
            name: 'task2'
          },
        },
        'SubTask':{
          [subtask1.uuid]:{
            uuid: subtask1.uuid,
            taskId: task1.uuid,
            name: 'subtask1'
          },
          [subtask2.uuid]:{
            uuid: subtask2.uuid,
            taskId: task1.uuid,
            name: 'subtask2'
          },
          [subtask3.uuid]:{
            uuid: subtask3.uuid,
            taskId: task1.uuid,
            name: 'subtask3'
          }
        },
        'SubSubTask':{
        }
      });

      const task3uuid = subtask3.uuid;
      expect(datastruct.immutable.toJSON().SubTask)
        .to.have.property(task3uuid);
      subtask3.delete();
      expect(datastruct.immutable.toJSON().SubTask)
        .to.not.have.property(task3uuid);
    });

  });


  describe('#deleted_throw', () => {
    const {db, Task, SubTask} = initDb();

    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: "Subtask1", task: task1});
    const subtask2 = new SubTask({name: "Subtask2", task: task2});

    it('get_property', () => {
      const getName = (el) => (() => el.name);

      expect(getName(task1)).to.not.throw();
      expect(getName(task2)).to.not.throw();

      task1.delete();

      expect(getName(task1)).to.throw();
      expect(getName(task2)).to.not.throw();
    });

    it('double_delete', () => {
      expect(() => {
        task2.delete();
      }).to.not.throw();
      expect(() => {
        task2.delete();
      }).to.throw();
    })
  });

  describe('#delete_reference', () => {
    const {db, Task, SubTask} = initDb();

    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1});
    const subtask1_2 = new SubTask({name: 'subtask1_2', task: task1});

    it('init', () => {
      expect(TinySeq(task1.subtasks).size()).to.eq(2);
      expect(TinySeq(task2.subtasks).size()).to.eq(0);
    });

    it('delete', () => {
      subtask1_2.delete();
      expect(TinySeq(task1.subtasks).size()).to.eq(1);
      expect(TinySeq(task2.subtasks).size()).to.eq(0);
    });
  });

  describe('#udpate_reference', () => {
    const {db, Task, SubTask} = initDb();

    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1});
    const subtask1_2 = new SubTask({name: 'subtask1_2', task: task1});

    it('init', () => {
      expect(TinySeq(task1.subtasks).size()).to.eq(2);
      expect(TinySeq(task2.subtasks).size()).to.eq(0);
    });

    it('update', () => {
      subtask1_2.task = task2;
      expect(TinySeq(task1.subtasks).size()).to.eq(1);
      expect(TinySeq(task2.subtasks).size()).to.eq(1);
    });

  });


  describe('#custom_class', () => {
    class myTask extends Entity{
      constructor(...args){
        super(...args);
      }
      get important(){
        return TinySeq(this.subtasks).filter(e=>e.priority > 1).toObject();
      }
    };

    const {db, Task, SubTask} = initDb(undefined, {Task: myTask});
    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});
    const subtask1 = new SubTask({name: 'subtask1', task: task1, priority: 1});
    const subtask2 = new SubTask({name: 'subtask2', task: task1, priority: 2});
    const subtask3 = new SubTask({name: 'subtask3', task: task1, priority: 3});
    const subtask2_1 = new SubTask({name: 'subtask2_1', task: task2, priority: 1});

    it('className', () => {
      expect(Task.prototype.className).to.eq('Task');
    });

    it('userMethod', () => {
      expect(task1.important).to.deep.equal({
        [subtask2.uuid]: subtask2,
        [subtask3.uuid]: subtask3
      });
      expect(Task.prototype.className).to.eq('Task');
    });
  });

  describe("#sync_through_ds", () => {
    const {
      commit, 
      test,
      Task, 
      SubTask, 
      SubSubTask} = initSyncThroughDataStruct();

    const task0 = new Task({name: 'task0'});

    commit();

    
    const task1 = new Task({name: 'task1'});
    commit();
    test("Added task1");

    task1.name = 'task1_updated';
    commit();
    test("Updated task1");

    const task2 = new Task({name: 'task23', description: 'second task'});
    commit();
    test("Added task2");

    const task3 = new Task({name: 'task3', description: 'third task'});
    commit();
    test("Added task3");

    const subtask1 = new SubTask({name: 'subtask23', task: task1, description: 'subtask'});
    commit();
    test("Added nested");

    task2.delete();
    commit();
    test("Deleted task2");

    task3.delete();
    commit();
    test("Deleted task3");

  /*
    subtask1.task = task0;
    commit();
    test("updated reference");
  */  


  })

});
