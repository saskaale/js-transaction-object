import DataStruct from './src/datastruct';
import {createDatabase, createEntity, Entity, Database} from './src/orm';
import {TinySeq} from './src/utils';
const WebSocket = require('websocket').w3cwebsocket;


const datastruct = new DataStruct();
const {db, Task, SubSubTask, SubTask} = initDb(datastruct);

const task1 = new Task({name: 'task1'});
/*const task2 = new Task({name: 'task2'});
const subtask1 = new SubTask({name: 'subtask1', task: task1});
const subtask2 = new SubTask({name: 'subtask2', task: task1});
const subtask3 = new SubTask({name: 'subtask3', task: task1});*/
//datastruct.commit();
task1.description = 'DESCR1';
datastruct.commit();
