import type { NextFunction, Request, Response } from 'express'
import { HydratedDocument } from 'mongoose'
import { IUser } from '../../DB/models/users/user.model.js'
import authenticateUtilts from '../utils/authentication.utils.js'

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let { authorization }: any = req.headers
  const { user, token, decoded } = await authenticateUtilts(authorization)
  req.user = user as HydratedDocument<IUser>
  req.token = token as string
  req.tokenDecoded = decoded
  next()
}

export async function authenticateGQL(context: any): Promise<any> {
  let { authorization } = context.req.headers

  const { user, token, decoded } = await authenticateUtilts(authorization)
  return {
    user,
    token,
    decoded,
  }
}

export async function authenticateSocket(socket: any): Promise<any> {
  const { authorization } =
    socket.handshake.auth.authorization ||
    socket.handshake.headers.authorization
  const { user, token, decoded } = await authenticateUtilts(authorization)
  return { user, token, decoded }
}
