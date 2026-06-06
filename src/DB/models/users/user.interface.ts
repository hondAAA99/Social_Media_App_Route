import { Schema } from "mongoose"

export interface IEmailData {
  data: string
  availibilty: string
}

export interface IPhoneData {
  data: string
  availibilty: string
}

export interface IAgeData {
  data: Date
  availibilty: string
}

export interface IGenderData {
  data: string
  availibilty: string
}

export interface IFriendItem {
  flag: string
  friendId: Schema.Types.ObjectId
}

export interface IFriendsData {
  availibilty: string
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
  confirmed?: boolean | undefined
  provider?: string
  deletedAt?: Date
  twoStepVerfiction: boolean
  creadnatials?: Date
}
