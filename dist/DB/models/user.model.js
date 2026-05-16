import mongoose, { model, Schema } from "mongoose";
import roleEnum from "../../common/enum/role.enum.js";
import genderEnum from "../../common/enum/gender.enum.js";
import providerEnum from "../../common/enum/provider.enum.js";
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function () {
            if (this.provider == providerEnum.system)
                return true;
            else
                return false;
        },
    },
    role: {
        type: String,
        default: roleEnum.user,
        enum: Object.values(roleEnum),
    },
    gender: {
        type: String,
        default: genderEnum.preferNotToSay,
        enum: Object.values(genderEnum),
    },
    phone: {
        type: String,
        required: function () {
            if (this.provider == providerEnum.system)
                return true;
            else
                return false;
        },
    },
    age: {
        type: String,
        min: 12,
        required: function () {
            if (this.provider == providerEnum.system)
                return true;
            else
                return false;
        },
    },
    confirmed: { type: Boolean, default: false },
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.system,
    },
    profilePicture: { type: String },
    creadnatials: { type: Date },
    deletedAt: { type: Date },
    friends: { type: [Schema.Types.ObjectId] },
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
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid == true) {
        this.setQuery({ deleteAt: { $exists: false }, rest });
    }
    else
        this.setQuery({ rest });
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
