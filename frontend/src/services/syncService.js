import API from "../api/api"
import {getOfflineTasks,clearOfflineTasks} from "./indexedDB"

export const syncTasks=async()=>{

 const tasks=await getOfflineTasks()

 for(const task of tasks){
  await API.post("/tasks",task)
 }

 await clearOfflineTasks()
}

window.addEventListener("online",syncTasks)