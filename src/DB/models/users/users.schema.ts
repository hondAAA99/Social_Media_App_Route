import {
  IAgeData,
  IEmailData,
  IFriendItem,
  IFriendsData,
  IGenderData,
  IPhoneData,
  IUser,
} from './user.interface.js'
import { Schema } from 'mongoose'
import UserSchemaHelpersCalling from './schema.helpers.js'
import AvailabilityEnum from '../../../common/enum/availablity.enum.js'
import {
  friendsFlagEnum,
  genderEnum,
  providerEnum,
  roleEnum,
} from '../../../common/enum/user.base.enum.js'

const emailSchema = new Schema<IEmailData>({
  data: { type: String },
  availability: {
    type: String,
    enum: Object.values(AvailabilityEnum),
    default: AvailabilityEnum.onlyMe,
  },
})

const phoneSchema = new Schema<IPhoneData>({
  data: { type: String },
  availability: {
    type: String,
    enum: Object.values(AvailabilityEnum),
    default: AvailabilityEnum.onlyMe,
  },
})

const ageSchema = new Schema<IAgeData>({
  data: { type: Date },
  availability: {
    type: String,
    enum: Object.values(AvailabilityEnum),
    default: AvailabilityEnum.onlyMe,
  },
})

const genderSchema = new Schema<IGenderData>({
  data: {
    type: String,
    enum: Object.values(genderEnum),
    default: genderEnum.preferNotToSay,
  },
  availability: {
    type: String,
    enum: Object.values(AvailabilityEnum),
    default: AvailabilityEnum.onlyMe,
  },
})

const friendItemSchema = new Schema<IFriendItem>({
  flag: {
    type: String,
    enum: Object.values(friendsFlagEnum),
    default: friendsFlagEnum.requested,
  },
  friendId: { type: Schema.Types.ObjectId, ref: 'users' },
})

const friendsSchema = new Schema<IFriendsData>({
  availability: {
    type: String,
    enum: Object.values(AvailabilityEnum),
    default: AvailabilityEnum.onlyMe,
  },
  data: {
    type: [friendItemSchema],
  },
})

export const userSchema = new Schema<IUser>(
  {
    blockedUsers: { type: [Schema.Types.ObjectId] },
    friends: friendsSchema,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: emailSchema,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    role: {
      type: String,
      default: roleEnum.user,
      enum: Object.values(roleEnum),
    },
    provider: {
      type: String,
      default: providerEnum.system,
      enum: Object.values(providerEnum),
    },
    profilePicture: {
      type: String,
      default: {
        data: undefined,
        availability: AvailabilityEnum.public,
      },
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    phone: {
      type: phoneSchema,
      default: {
        data: '',
        availability: AvailabilityEnum.onlyMe,
      },
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    age: {
      type: ageSchema,
      default: {
        data: undefined,
        availability: AvailabilityEnum.onlyMe,
      },
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    gender: {
      type: genderSchema,
      default: {
        data: genderEnum.preferNotToSay,
        availability: AvailabilityEnum.onlyMe,
      },
    },
    profileLock: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    twoStepVerification: { type: Boolean, default: false },
    credentials: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
  },
)

UserSchemaHelpersCalling()
