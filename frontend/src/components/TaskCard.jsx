export default function TaskCard({task}){

 return(
  <div className="card p-3 mb-2">

   <h5>{task.title}</h5>

   <p>{task.completed ? "Completed":"Pending"}</p>

  </div>
 )
}