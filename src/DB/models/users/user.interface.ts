import { Schema } from 'mongoose'

export interface IEmailData {
  data: string
  availability?: string
}

export interface IPhoneData {
  data: string
  availability?: string
}

export interface IAgeData {
  data: Date
  availability?: string
}

export interface IGenderData {
  data: string
  availability?: string
}

export interface IFriendItem {
  flag: string
  friendId: Schema.Types.ObjectId
}

export interface IFriendsData {
  availability?: string
  data: IFriendItem[]
}

export interface IUser {
  id?: Schema.Types.ObjectId
  firstName: string
  lastName: string
  userName: string
  email: IEmailData
  profilePicture?: String
  friends: IFriendsData
  phone?: IPhoneData
  age?: IAgeData
  gender?: IGenderData
  profileLock?: boolean
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
}
