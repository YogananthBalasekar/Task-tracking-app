import User from "../models/User.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js"

export const signup = async (req, res) => {
  const { name, email, password } = req.body

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email,
    password: hashed
  })

  res.json({
    token: generateToken(user._id)
  })
}

export const login = async (req, res) => {
  const { email, password } = req.bod
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ msg: "User not found" })
  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ msg: "Invalid password" })
  res.json({
    token: generateToken(user._id)
  })
}