import assert from 'assert';
import DataStruct from '../src/datastruct';
var expect = require('chai').expect;

import {createDatabase, createEntity, Entity, Database} from '../src/orm';

describe('ORM', () => {
  const initDb = () => {
    const MyDb = createDatabase('MyDb');
    const db = new MyDb();
    const Task = createEntity('Task', db, {name: null, description: null}, {subtasks: null, subsubtasks: null});
    const SubTask = createEntity('SubTask', db, {task: {type:'Task', ref: 'subtasks'}, name: null, description: null}, {subsubtasks: null});
    const SubSubTask = createEntity('SubSubTask', db, {subtask: {type:'SubTask', ref: 'subsubtasks'}, name: null});
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

  describe('#datastruct', () => {
    const datastruct = new DataStruct();
    const {db, Task, SubSubTask, SubTask} = initDb(datastruct);
  });

});
