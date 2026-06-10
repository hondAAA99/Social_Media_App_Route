import { HydratedDocument, Schema } from 'mongoose'
import { IUser } from '../../DB/models/users/user.interface.js'
import { ErrorNotFound, ErrorUnAuthorizedRequest } from '../../common/utils/globalresponse.js'

export const isUserBlocked = (
  user: HydratedDocument<IUser>,
  blockedId: Schema.Types.ObjectId,
) => {
  if (!user) return ErrorNotFound('user not found')

  const checkBlocking = user.blockedUsers?.map(blId => {
    return blId == blockedId
  })

  if (checkBlocking) ErrorUnAuthorizedRequest('due to blocking user')
}
