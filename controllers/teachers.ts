import { Router } from "express"
import httpStatus from "http-status"

import { Learner } from "../models/learner"
import { Teacher } from "../models/teacher"
import { User } from "../models/user"

const teachersRouter = Router()

// TODO: Write aggregate query to get all learners for a teacher
teachersRouter.get("/favourite", async (request, response) => {})

teachersRouter.post("/add/:id", async (request, response) => {
  if (!request.user) {
    return response
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: "unauthorized" })
  }

  const ID = request.params.id
  const user = await User.findById(request.user)

  if (!user) {
    return response.status(httpStatus.NOT_FOUND).json({ error: "userNotFound" })
  }

  const teacher = await Teacher.findById(ID)
  if (!teacher) {
    return response
      .status(httpStatus.NOT_FOUND)
      .json({ error: "teacherNotFound" })
  }
  const learner =
    (await Learner.findById(user.id)) ??
    (await new Learner({ userId: user.id }).save())

  learner.favouriteTeachers = learner.favouriteTeachers.concat(teacher.id)
  await learner.save()

  response
    .status(httpStatus.OK)
    .json({ message: "teacherAdded", teacher, user })
})
