import {openDB} from "idb"

const dbPromise=openDB("taskDB",1,{
 upgrade(db){
  db.createObjectStore("tasks",{keyPath:"id"})
 }
})

export const saveOfflineTask=async(task)=>{
 const db=await dbPromise
 await db.put("tasks",task)
}

export const getOfflineTasks=async()=>{
 const db=await dbPromise
 return db.getAll("tasks")
}

export const clearOfflineTasks=async()=>{
 const db=await dbPromise
 const tx=db.transaction("tasks","readwrite")
 tx.store.clear()
}