import logger from "./logger"
import jwt from "jsonwebtoken"
import { SIGN_KEY } from "./config"
import { NextFunction, Request, Response } from "express"

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info("Method:", req.method)
  logger.info("Path:  ", req.path)
  logger.info("Body:  ", req.body)
  logger.info("---")
  next()
}

const tokenExtractor = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    req.token = authorization.substring(7)
  }
  next()
}

const userExtractor = (req: Request, res: Response, next: NextFunction) => {
  if (req.token) {
    const decodedToken = jwt.verify(req.token, SIGN_KEY)
    req.user = (decodedToken as jwt.JwtPayload).id
  }
  next()
}

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).json({ error: "malformed id" })
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message })
  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: error.message })
  } else if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "token expired" })
  }

  next(error)
}

const unknownEndpoint = (req: Request, res: Response) => {
  res.status(404).send({ error: "unknown endpoint" })
}

export default {
  requestLogger,
  tokenExtractor,
  userExtractor,
  errorHandler,
  unknownEndpoint,
}
