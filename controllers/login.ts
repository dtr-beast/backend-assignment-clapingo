import { Router } from "express"
import { SALT_ROUNDS, SIGN_KEY, TOKEN_EXPIRE_TIME } from "../utils/config"
import { User, UserType } from "../models/user"

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const authRouter = Router()

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body

  const user = await User.findOne({ email })

  if (!user) {
    return response
      .status(401)
      .send({ error: `Could not find any user with the email: ${email}` })
  }
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    return response.status(401).json({ error: "invalidPassword" })
  }

  const token = createToken(user)

  response.status(200).json({ token, email: user.email, name: user.name })
})

authRouter.post("/register", async (request, response) => {
  const { email, password, name } = request.body

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  // TODO: Add error handling for duplicate email
  const user = new User({
    email,
    passwordHash,
    name,
  })

  const savedUser = await user.save()
  const token = createToken(savedUser)

  response
    .status(200)
    .json({ token, email: savedUser.email, name: savedUser.name })
})

function createToken(user: UserType) {
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  }
  const authToken = jwt.sign(tokenPayload, SIGN_KEY, {
    expiresIn: TOKEN_EXPIRE_TIME,
  })
  return authToken
}

export default authRouter
