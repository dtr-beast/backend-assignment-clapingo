import { Router } from "express"
import httpStatus from "http-status"

import { Learner } from "../models/learner"
import { Teacher, TeacherType } from "../models/teacher"
import { User, UserType } from "../models/user"
import logger from "../utils/logger"

const teachersRouter = Router()

export interface Result {
  _id: number
  favouriteTeacherIds: string[]
  users: UsersEntity[]
}
export interface UsersEntity {
  _id: string
  email: string
  name: string
  teacherId: string
}

teachersRouter.get("/favourite", async (request, response) => {
  const result = await Learner.aggregate<Result>([
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
      $group: {
        _id: "$count",
        favouriteTeacherIds: {
          $push: "$_id",
        },
      },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: "users",
        localField: "favouriteTeacherIds",
        foreignField: "teacherId",
        as: "users",
      },
    },
  ])
  if (!result || result.length === 0) {
    response.status(httpStatus.OK).json({ message: "No favourite teachers" })
  }

  return response
    .status(httpStatus.OK)
    .json(
      result[0].users.map((u) => ({ name: u.name, email: u.email, id: u._id }))
    )
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
