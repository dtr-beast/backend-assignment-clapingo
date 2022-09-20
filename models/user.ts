import mongooseUniqueValidator from 'mongoose-unique-validator'
import { Schema, model } from 'mongoose'
import { z } from 'zod'

const UserValidator = z.object({
    id: z.string().optional(),
    email: z.string().email(),
    name: z.string(),
    // TODO: Look into transform
    phoneNumber: z.string().length(10).transform(Number),
    passwordHash: z.string(),
    // TODO: Remove this before pushing
    // learner: z.instanceof(Schema.Types.ObjectId).optional(),
    // favouriteTeachers: z.array(z.string()).optional()
}).strict()

type UserType = z.infer<typeof UserValidator>

// TODO: Add phoneNumber 
const userSchema = new Schema<UserType>({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    }
    // learner: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Learner'
    // }
    // favouriteTeachers: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Teacher'
    //     }
    // ]
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

const User = model<UserType>('User', userSchema)

export { User, UserValidator, UserType } 