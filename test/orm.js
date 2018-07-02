import { assert, expect } from 'chai';

import DataStruct from '../src/datastruct';
import {createDatabase, createEntity, Entity, Database} from '../src/orm';

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
    const {db, Task} = initDb();

    const task1 = new Task({name: 'task1'});
    const task2 = new Task({name: 'task2'});


    it('test', () => {
      const getName = (el) => (() => el.name);

      expect(getName(task1)).to.not.throw();
      expect(getName(task2)).to.not.throw();

      task1.delete();

      expect(getName(task1)).to.throw();
      expect(getName(task2)).to.not.throw();
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

    it('className', () => () => {
      expect(Task.prototype.className).to.eq('Task');
    });

    it('userMethod', () => () => {
      expect(task1.important).to.deep.equal({
        [subtask2.uuid]: subtask2,
        [subtask3.uuid]: subtask3
      })
      expect(Task.prototype.className).to.eq('Task');
    });
  });

});
