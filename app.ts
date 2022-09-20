import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import middleware from './utils/middleware'
import logger from './utils/logger'
import mongoose from 'mongoose'
import { MONGODB_URI } from './utils/config'

import authRouter from './controllers/login'


const app = express()
logger.info(`Connecting to MongoDB at: ${MONGODB_URI}`)
mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB')
    })
    .catch((error) => {
        logger.error(`Error connecting to MongoDB: ${error.message}`)
    })

app.use(cors())
app.use(express.static('out'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// TODO: Add routes here
// app.use('/api/teachers', middleware.userExtractor, )
app.use('/api/login', authRouter)

if (process.env.NODE_ENV === 'TEST') {
    const testingRouter = require("./routes/testing");
    app.use('/api/testing', testingRouter)
    logger.info("Testing Mode")
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
