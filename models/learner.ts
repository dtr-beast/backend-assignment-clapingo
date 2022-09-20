import mongooseUniqueValidator from 'mongoose-unique-validator'
import { Schema, model } from 'mongoose'
import { z } from 'zod'

const LearnerValidator = z.object({
    userId: z.instanceof(Schema.Types.ObjectId),
    favouriteTeachers: z.array(z.instanceof(Schema.Types.ObjectId))
}).strict()

type LearnerType = z.infer<typeof LearnerValidator>

// TODO: Add phoneNumber 
const userSchema = new Schema<LearnerType>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    favouriteTeachers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Teacher'
        }
    ]
})

userSchema.plugin(mongooseUniqueValidator)

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const Learner = model<LearnerType>('User', userSchema)

export { Learner, LearnerValidator, LearnerType } 