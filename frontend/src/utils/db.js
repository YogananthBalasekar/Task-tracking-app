import Dexie from 'dexie';

export const db = new Dexie('TaskDatabase');

db.version(1).stores({
  tasks: '++id, serverId, title, completed, synced',
  queue: '++id, action'
});

db.version(2).stores({
  tasks: '++id, serverId, title, completed, synced',
  queue: '++id, action',
  user: 'id, email, password, token'  
});