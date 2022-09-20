import { Router } from "express"
import httpStatus from "http-status"

import { Learner } from "../models/learner"
import { Teacher, TeacherType } from "../models/teacher"
import { User, UserType } from "../models/user"
import logger from "../utils/logger"

const teachersRouter = Router()

teachersRouter.get("/favourite", async (request, response) => {
  const result = await Learner.aggregate<TeacherType & { user: UserType[] }>([
    {
      $unwind: {
        path: "$favouriteTeachers",
        includeArrayIndex: "idx",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: "$favouriteTeachers",
        count: {
          $count: {},
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "teacherId",
        as: "user",
      },
    },
  ])
  if (!result) {
    response.status(httpStatus.OK).json({ message: "No favourite teachers" })
  }

  return response.status(httpStatus.OK).send({ name: result[0].user[0].name })
})

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
  const learner = await Learner.findOneAndUpdate(
    { userId: user.id },
    { $addToSet: { favouriteTeachers: teacher.id } },
    { new: true }
  )
  if (!learner) {
    logger.error("Learner not found")
    return response
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "learnerNotFound" })
  }

  response
    .status(httpStatus.OK)
    .json({ message: "teacherAdded", learner, user })
})

// Remove teacher added to favourite list
teachersRouter.post("/remove/:id", async (request, response) => {
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
  const learner = await Learner.findOneAndUpdate(
    { userId: user.id },
    { $pull: { favouriteTeachers: teacher.id } },
    { new: true }
  )
  if (!learner) {
    logger.error("Learner not found")
    return response
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "learnerNotFound" })
  }

  response
    .status(httpStatus.OK)
    .json({ message: "teacherRemoved", learner, user })
})

export default teachersRouter
