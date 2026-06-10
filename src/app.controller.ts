import express from 'express'
import type { Application, Request, Response, NextFunction } from 'express'
import { PORT, HOST } from './config/config.services.js'
import helmet from 'helmet'
import cors from 'cors'
import {
  globalErrorHandling,
  ErrorNotFound,
} from './common/utils/globalresponse.js'

import limiter from './common/middleware/limiter.js'
import { checkDataBaseConnection } from './DB/DB.connection.js'
import { authRouter } from './module/auth/auth.controller.js'
import { userRouter } from './module/user/user.controller.js'
import redisServices, { _client } from './common/services/redis.services.js'
import postRouter from './module/posts/post.controller.js'
import { createHandler } from 'graphql-http/lib/use/express'
import GQLSchema from './module/graphql/graphql.schema.js'
import { deleteUnconfirmedUsersCronJob } from './common/utils/cronJob.js'
import socketGateWay from './module/realTime/socket.gateway.js'
import storyRouter from './module/story/story.controller.js'

const app: Application = express()
const port = Number(PORT)
const host = HOST

const bootstrap = async () => {
  app.use(express.json())
  app.use(helmet(), cors(), limiter)
  app.use(deleteUnconfirmedUsersCronJob)
  await checkDataBaseConnection()
  _client.connect() // redis client
  app.use('/auth', authRouter)
  app.use('/users', userRouter)
  app.use('/posts', postRouter)
  app.use('/stories', storyRouter)

  app.use(
    '/graphql',
    createHandler({ schema: GQLSchema, context: req => ({ req }) }),
  )

  app.all('{/*demo}', (req: Request, res: Response, next: NextFunction) => {
    ErrorNotFound(
      `the request on ${req.url} with method ${req.method} has wrong path`,
    )
  })

  app.use(globalErrorHandling)

  const appServer = app.listen(port, () => {
    console.log(`app is running on port ${port}`)
  })

  new socketGateWay(appServer).initIo
}

export default bootstrap
