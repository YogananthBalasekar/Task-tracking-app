import {useState} from "react"

export default function TaskForm({onSubmit}){

 const [title,setTitle]=useState("")

 return(
  <form onSubmit={(e)=>{
   e.preventDefault()
   onSubmit(title)
   setTitle("")
  }}>

   <input
    value={title}
    onChange={(e)=>setTitle(e.target.value)}
    placeholder="Task title"
   />

   <button>Add</button>

  </form>
 )
}