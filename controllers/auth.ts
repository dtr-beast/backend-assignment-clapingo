import { Router } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import bodyParser from "body-parser"

import { SALT_ROUNDS, SIGN_KEY, TOKEN_EXPIRE_TIME } from "../utils/config"
import { User, UserType } from "../models/user"
import { Teacher } from "../models/teacher"
import { Learner } from "../models/learner"
import logger from "../utils/logger"
import validateData from "../utils/data_validator"
import { z } from "zod"

const authRouter = Router()

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body
  bodyParser.json({})

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

const signupData = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  }),
  query: z.object({
    teacher: z
      .string()
      .refine((v) => v === "true" || v === "false")
      .optional(),
  }),
})

authRouter.post(
  "/signup",
  validateData(signupData),
  async (request, response) => {
    const { email, password, name } = request.body

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const user = new User({
      email,
      passwordHash,
      name,
    })

    const savedUser = await user.save()

    let teacher = null
    if (Boolean(request.query.teacher)) {
      teacher = await new Teacher({
        userId: savedUser.id,
      }).save()
      savedUser.teacherId = teacher.id
      logger.info(`Teacher created with id <${teacher.id}>`)
    } else {
      const learner = await new Learner({
        userId: savedUser.id,
      }).save()
      savedUser.learnerId = learner.id
      logger.info(`Learner created with id <${learner.id}>`)
    }

    await savedUser.save()
    const token = createToken(savedUser)

    response.status(200).json({
      token,
      email: savedUser.email,
      name: savedUser.name,
      id: user.id,
      teacherId: teacher?.id,
    })
  }
)

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
