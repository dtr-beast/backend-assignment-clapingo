import mongooseUniqueValidator from "mongoose-unique-validator"
import { Schema, model } from "mongoose"
import { z } from "zod"

const TeacherValidator = z
  .object({
    userId: z.instanceof(Schema.Types.ObjectId),
  })
  .strict()

type TeacherType = z.infer<typeof TeacherValidator>

const teacherSchema = new Schema<TeacherType>({
  userId: {
    required: true,
    unique: true,
    type: Schema.Types.ObjectId,
    ref: "User",
  },
})

teacherSchema.plugin(mongooseUniqueValidator)

teacherSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

const Teacher = model<TeacherType>("Teacher", teacherSchema)

export { TeacherType, TeacherValidator, Teacher }
