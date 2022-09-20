import mongooseUniqueValidator from "mongoose-unique-validator"
import { Schema, model } from "mongoose"
import { z } from "zod"

const UserValidator = z
  .object({
    id: z.string().optional(),
    email: z.string().email(),
    name: z.string(),
    passwordHash: z.string(),
    teacherId: z.instanceof(Schema.Types.ObjectId).optional(),
    learnerId: z.instanceof(Schema.Types.ObjectId).optional(),
  })
  .strict()

type UserType = z.infer<typeof UserValidator>

const userSchema = new Schema<UserType>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
  },
  learnerId: {
    type: Schema.Types.ObjectId,
    ref: "Learner",
  },
})

userSchema.plugin(mongooseUniqueValidator)

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

const User = model<UserType>("User", userSchema)

export { User, UserValidator, UserType }
