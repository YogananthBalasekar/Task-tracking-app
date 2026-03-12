import Task from "../models/Task.js"

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id })
  res.json(tasks)
}

export const createTask = async (req, res) => {
  const task = await Task.create({
    userId: req.user.id,
    title: req.body.title,
  })
  res.json(task)
}

export const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  })
  res.json(task)
}

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)
  res.json({ message: "Task deleted" })
}