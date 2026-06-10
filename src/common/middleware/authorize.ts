import type { NextFunction, Request, Response } from 'express'
import { ErrorUnAuthorizedRequest } from '../utils/globalresponse.js'

export function authorize(arrOfRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    authorizeBase_GQL(arrOfRoles, user?.role!)
    next()
  }
}
export function authorizeBase_GQL(arrOfRoles: string[], role: string) {
  if (!arrOfRoles.includes(role)) {
    return ErrorUnAuthorizedRequest('you are not authorized')
  }
}
