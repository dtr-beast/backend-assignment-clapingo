require('dotenv').config()

const PORT = Number(process.env.PORT) || 3000
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 5
const SIGN_KEY = process.env.SIGN_KEY ?? 'THIS_IS_NOT_A_GOOD_KEY'
const TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME ?? '3m'
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/favouriteTeachers' 

export {
    PORT,
    SALT_ROUNDS,
    SIGN_KEY,
    TOKEN_EXPIRE_TIME,
    MONGODB_URI
}
