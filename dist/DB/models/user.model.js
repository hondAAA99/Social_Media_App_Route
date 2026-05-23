import mongoose, { model, Schema } from "mongoose";
import roleEnum from "../../common/enum/role.enum.js";
import genderEnum from "../../common/enum/gender.enum.js";
import providerEnum from "../../common/enum/provider.enum.js";
import availabiltyEnum from "../../common/enum/availablity.enum.js";
const userSchema = new Schema({
    profileLock: { type: Boolean, default: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: new Schema({
            data: { type: String },
            availibilty: { type: String, enum: Object.values(availabiltyEnum) },
        }),
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
    gender: {
        type: new Schema({
            data: {
                type: String,
                enum: Object.values(genderEnum),
                default: genderEnum.preferNotToSay,
            },
            availibilty: { type: String, enum: Object.values(availabiltyEnum) },
        }),
        default: {
            data: genderEnum.preferNotToSay,
            availibilty: availabiltyEnum.onlyMe,
        },
    },
    phone: {
        type: new Schema({
            data: { type: String },
            availibilty: { type: String, enum: Object.values(availabiltyEnum) },
        }),
        default: {
            data: "",
            availibilty: availabiltyEnum.onlyMe,
        },
        required: function () {
            return this.provider === providerEnum.system;
        },
    },
    age: {
        type: new Schema({
            data: { type: Date },
            availibilty: { type: String, enum: Object.values(availabiltyEnum) },
        }),
        default: {
            data: undefined,
            availibilty: availabiltyEnum.onlyMe,
        },
        required: function () {
            return this.provider === providerEnum.system;
        },
    },
    confirmed: { type: Boolean, default: false },
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
    creadnatials: { type: Date },
    deletedAt: { type: Date },
    friends: {
        type: new Schema({
            data: [{ type: Schema.Types.ObjectId, ref: "users" }],
            availibilty: { type: [String], enum: Object.values(availabiltyEnum) },
        }),
    },
    twoStepVerfiction: { type: Boolean, default: false },
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
});
userSchema
    .virtual("userName")
    .set(function (value) {
    const [fn, ln] = value.split(" ");
    this.firstName = fn;
    this.lastName = ln;
})
    .get(function () {
    return this.firstName + " " + this.lastName;
});
userSchema.pre(["findOne", "find"], function () {
    const query = this.getQuery();
    const { paranoid, ...rest } = query;
    if (paranoid === true) {
        this.setQuery({ deletedAt: { $exists: false }, ...rest });
    }
    else {
        this.setQuery({ ...rest });
    }
});
userSchema.pre(["deleteMany", "deleteOne", "findOneAndDelete"], async function () {
    const condition = this.getQuery();
    const userId = condition._id;
    await Promise.all([
        mongoose.models.users.findByIdAndUpdate(userId, {
            deletedAt: Date.now(),
        }),
        mongoose.models.posts.findOneAndUpdate({
            createdBy: userId,
        }, { deletedAt: Date.now() }),
        mongoose.models.comments.findOneAndUpdate({
            createdBy: userId,
        }, { deletedAt: Date.now() }),
    ]);
});
const userModel = mongoose.models.users || model("users", userSchema);
export default userModel;
