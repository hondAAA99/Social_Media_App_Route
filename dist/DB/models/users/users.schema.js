import roleEnum from '../../../common/enum/role.enum.js';
import genderEnum from '../../../common/enum/gender.enum.js';
import providerEnum from '../../../common/enum/provider.enum.js';
import availabiltyEnum from '../../../common/enum/availablity.enum.js';
import { friendsFlagEnum } from '../../../common/enum/friendsFlag.enum.js';
import { Schema } from 'mongoose';
import UserSchemaHelpersCalling from './schema.helpers.js';
const emailSchema = new Schema({
    data: { type: String },
    availibilty: { type: String, enum: Object.values(availabiltyEnum) },
});
const phoneSchema = new Schema({
    data: { type: String },
    availibilty: { type: String, enum: Object.values(availabiltyEnum) },
});
const ageSchema = new Schema({
    data: { type: Date },
    availibilty: { type: String, enum: Object.values(availabiltyEnum) },
});
const genderSchema = new Schema({
    data: {
        type: String,
        enum: Object.values(genderEnum),
        default: genderEnum.preferNotToSay,
    },
    availibilty: { type: String, enum: Object.values(availabiltyEnum) },
});
const friendItemSchema = new Schema({
    flag: {
        type: String,
        enum: Object.values(friendsFlagEnum),
        default: friendsFlagEnum.requestd,
    },
    friendId: { type: Schema.Types.ObjectId, ref: 'users' },
});
const friendsSchema = new Schema({
    availibilty: { type: String, enum: Object.values(availabiltyEnum) },
    data: {
        type: [friendItemSchema],
    },
});
export const userSchema = new Schema({
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
        required: function () {
            return this.provider === providerEnum.system;
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
        required: function () {
            return this.provider === providerEnum.system;
        },
    },
    phone: {
        type: phoneSchema,
        default: {
            data: '',
            availibilty: availabiltyEnum.onlyMe,
        },
        required: function () {
            return this.provider === providerEnum.system;
        },
    },
    age: {
        type: ageSchema,
        default: {
            data: undefined,
            availibilty: availabiltyEnum.onlyMe,
        },
        required: function () {
            return this.provider === providerEnum.system;
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
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
});
UserSchemaHelpersCalling();
