import express from "express"
import "express-async-errors"
import cors from "cors"
import middleware from "./utils/middleware"
import logger from "./utils/logger"
import mongoose from "mongoose"
import { MONGODB_URI } from "./utils/config"

import authRouter from "./controllers/auth"
import teacherRouter from "./controllers/teachers"

const app = express()
logger.info(`Connecting to MongoDB at: ${MONGODB_URI}`)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB")
  })
  .catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error.message}`)
  })

app.use(cors())
app.use(express.static("out"))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use("/api/teachers", middleware.userExtractor, teacherRouter)
app.use("/api/auth", authRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
