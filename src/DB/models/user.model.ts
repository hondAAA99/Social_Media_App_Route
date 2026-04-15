import mongoose, { model, Schema } from "mongoose";
import roleEnum from "../../common/enum/role.enum.js";
import genderEnum from "../../common/enum/gender.enum.js";

export interface IUser {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role?: typeof roleEnum;
  gender?: typeof genderEnum;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  confirmed: boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    phone: { type: String },
    confirmed: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
  },
);

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

const userModel = mongoose.models.users || model("users", userSchema);

export default userModel;
