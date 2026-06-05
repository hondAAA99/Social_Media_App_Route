import mongoose, { model, Schema } from 'mongoose'
import roleEnum from '../../common/enum/role.enum.js'
import genderEnum from '../../common/enum/gender.enum.js'
import providerEnum from '../../common/enum/provider.enum.js'
import availabiltyEnum from '../../common/enum/availablity.enum.js'
import { friendsFlagEnum } from '../../common/enum/friendsFlag.enum.js'

interface IEmailData {
  data: string
  availibilty: string
}

interface IPhoneData {
  data: string
  availibilty: string
}

interface IAgeData {
  data: Date
  availibilty: string
}

interface IGenderData {
  data: string
  availibilty: string
}

interface IFriendItem {
  flag: string
  friendId: Schema.Types.ObjectId
}

interface IFriendsData {
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

const emailSchema = new Schema<IEmailData>({
  data: { type: String },
  availibilty: { type: String, enum: Object.values(availabiltyEnum) },
})

const phoneSchema = new Schema<IPhoneData>({
  data: { type: String },
  availibilty: { type: String, enum: Object.values(availabiltyEnum) },
})

const ageSchema = new Schema<IAgeData>({
  data: { type: Date },
  availibilty: { type: String, enum: Object.values(availabiltyEnum) },
})

const genderSchema = new Schema<IGenderData>({
  data: {
    type: String,
    enum: Object.values(genderEnum),
    default: genderEnum.preferNotToSay,
  },
  availibilty: { type: String, enum: Object.values(availabiltyEnum) },
})

const friendItemSchema = new Schema<IFriendItem>({
  flag: {
    type: String,
    enum: Object.values(friendsFlagEnum),
    default: friendsFlagEnum.requestd,
  },
  friendId: { type: Schema.Types.ObjectId, ref: 'users' },
})

const friendsSchema = new Schema<IFriendsData>({
  availibilty: { type: String, enum: Object.values(availabiltyEnum) },
  data: {
    type: [friendItemSchema],
  },
})

const userSchema = new Schema<IUser>(
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
        availibilty: availabiltyEnum.public,
      },
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    phone: {
      type: phoneSchema,
      default: {
        data: '',
        availibilty: availabiltyEnum.onlyMe,
      },
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    age: {
      type: ageSchema,
      default: {
        data: undefined,
        availibilty: availabiltyEnum.onlyMe,
      },
      required: function (this: any): boolean {
        return this.provider === providerEnum.system
      },
    },
    gender: {
      type: genderSchema,
      default: {
        data: genderEnum.preferNotToSay,
        availibilty: availabiltyEnum.onlyMe,
      },
    },
    profileLock: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    twoStepVerfiction: { type: Boolean, default: false },
    creadnatials: { type: Date },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
  },
)

userSchema
  .virtual('userName')
  .set(function (value) {
    const [fn, ln] = value.split(' ')
    this.firstName = fn
    this.lastName = ln
  })
  .get(function (this) {
    return this.firstName + ' ' + this.lastName
  })

userSchema.pre(['findOne', 'find'], function () {
  const query = this.getQuery()
  const { paranoid, ...rest } = query
  if (paranoid === true) {
    this.setQuery({ deletedAt: { $exists: false }, ...rest })
  } else {
    this.setQuery({ ...rest })
  }
})

userSchema.pre(
  ['deleteMany', 'deleteOne', 'findOneAndDelete'],
  async function () {
    const condition = this.getQuery()
    const userId = condition._id
    await Promise.all([
      mongoose.models.users!.findByIdAndUpdate(userId, {
        deletedAt: Date.now(),
      }),
      mongoose.models.posts!.findOneAndUpdate(
        {
          createdBy: userId,
        },
        { deletedAt: Date.now() },
      ),
      mongoose.models.comments!.findOneAndUpdate(
        {
          createdBy: userId,
        },
        { deletedAt: Date.now() },
      ),
    ])
  },
)

userSchema.index({ 'story.createdAt': 1 }, { expireAfterSeconds: 0 })

const userModel = mongoose.models.users || model('users', userSchema)

export default userModel
