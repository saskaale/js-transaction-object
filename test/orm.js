import assert from 'assert';
import DataStruct from '../src/datastruct';
var expect = require('chai').expect;

import {createDatabase, createEntity, Entity} from '../src/orm';

describe('ORM', () => {
  const initDb = () => {
    const MyDb = createDatabase('MyDb');
    const db = new MyDb();
    const Task = createEntity('Task', db, {name: null, description: null}, {subtasks: null});
    const SubTask = createEntity('SubTask', db, {task: {type:'Task', ref: 'subtasks'}, name: null, description: null});
    db.build();
    return {db, Task, SubTask, MyDb};
  }

  describe('#basic', () => {
    let {db, Task, SubTask} = initDb();
    let task1 = new Task({name: 'task1'});
    let task1_2 = new Task({name: 'task1'});
    let task2 = new Task({name: 'task2'});
    db.add(task1);
    db.add(task1_2);

    it('structure', () => {
      assert(task1 instanceof Entity);
      expect(Object.keys(db.Entities).sort((v1,v2) => v1.localeCompare(v2)))
        .to.deep.equal(['SubTask', 'Task']);
    });

    it('values', () => {
      assert(task1.uuid !== undefined);
      assert(task1_2.uuid !== task1.uuid);
      assert(task1_2.uuid !== task2.uuid);
      assert(task1.name === 'task1');
      assert(task1_2.name === 'task1');
      assert(task2.name === 'task2');
    });

  });
});
