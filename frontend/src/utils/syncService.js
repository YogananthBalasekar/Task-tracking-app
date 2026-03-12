import { db } from './db';
import { createTask, updateTask, deleteTask } from '../api/taskApi';

export async function syncOfflineTasks() {
  console.log('Syncing offline tasks...');
  const pendingActions = await db.queue.orderBy('id').toArray();

  if (pendingActions.length === 0) {
    console.log('No pending actions to sync.');
    return;
  }

  for (const action of pendingActions) {
    try {
      switch (action.action) {
        case 'create': {
          const response = await createTask({ title: action.data.title });
          const serverTask = response.data;

          const localTask = await db.tasks.get(action.data.id);
          if (localTask) {
            await db.tasks.delete(action.data.id);
            await db.tasks.add({
              serverId: serverTask._id,
              title: serverTask.title,
              completed: serverTask.completed,
              synced: true,
            });
          }
          break;
        }

        case 'update': {
          let task = await db.tasks.where('serverId').equals(action.data.id).first();
          if (!task) {
            task = await db.tasks.get(action.data.id);
          }
          if (task) {
            const serverId = task.serverId || action.data.id;
            await updateTask(serverId, action.data.body);
            await db.tasks.update(task.id, { synced: true });
          }
          break;
        }

        case 'delete': {
          let task = await db.tasks.where('serverId').equals(action.data.id).first();
          if (!task) {
            task = await db.tasks.get(action.data.id);
          }
          if (task) {
            if (task.serverId) {
              await deleteTask(task.serverId);
            }
            await db.tasks.delete(task.id);
          }
          break;
        }

        default:
          console.warn('Unknown action type:', action.action);
      }

      await db.queue.delete(action.id);
    } catch (error) {
      console.error('Failed to sync action:', action, error);
    }
  }
  console.log('Sync completed.');
}