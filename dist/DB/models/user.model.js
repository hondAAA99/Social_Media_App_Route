import mongoose, { model, Schema } from "mongoose";
import roleEnum from "../../common/enum/role.enum.js";
import genderEnum from "../../common/enum/gender.enum.js";
import providerEnum from "../../common/enum/provider.enum.js";
import { Globalhash } from "../../common/security/hash.js";
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
        }
    },
    role: {
        type: String,
        default: roleEnum.user,
        enum: Object.values(roleEnum),
    },
    gender: {
        type: String,
        default: genderEnum.male,
        enum: Object.values(genderEnum),
    },
    phone: {
        type: String,
        required: function () {
            if (this.provider == providerEnum.system)
                return true;
            else
                return false;
        }
    },
    confirmed: { type: Boolean, required: true, default: false },
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.system,
    },
    creadnatials: { type: Date },
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
userSchema.pre('save', function () {
    console.log('========1=========');
    console.log(this.modifiedPaths());
    if (this.isModified('password')) {
        this.password = Globalhash({ plainText: this.password });
    }
});
userSchema.post('save', function () {
    console.log('========2========');
    console.log(this);
});
const userModel = mongoose.models.users || model("users", userSchema);
export default userModel;
