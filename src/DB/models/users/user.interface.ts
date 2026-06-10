import { Schema } from 'mongoose'

export interface IEmailData {
  data?: string
  availability?: string
}
export interface IProfilePicture {
  data?: string
  availability?: string
}

export interface IPhoneData {
  data?: string
  availability?: string
}

export interface IAgeData {
  data?: Date
  availability?: string
}

export interface IGenderData {
  data?: string
  availability?: string
}

export interface IFriendItem {
  flag?: string
  friendId: Schema.Types.ObjectId
}

export interface IFriendsData {
  availability?: string
  data?: IFriendItem[]
}

export interface IUser {
  profileLock?: boolean
  id?: Schema.Types.ObjectId
  firstName: string
  lastName: string
  userName: string
  profilePicture?: String
  blockedUsers: Schema.Types.ObjectId[]
  role?: string
  password: string
  createdAt: Date
  updatedAt: Date
  confirmed?: boolean
  provider?: string
  deletedAt?: Date
  deletedBy?: Schema.Types.ObjectId
  twoStepVerification: boolean
  credentials?: Date
  email: IEmailData
  friends: IFriendsData
  phone?: IPhoneData
  age?: IAgeData
  gender?: IGenderData
}
