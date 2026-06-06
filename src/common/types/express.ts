import { HydratedDocument } from 'mongoose'
import jsonwebtoken from 'jsonwebtoken'
import { IUser } from '../../DB/models/users/user.model.js'

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>
      token: string
      tokenDecoded: jsonwebtoken.JwtPayload
    }
  }
}
