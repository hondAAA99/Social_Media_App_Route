import mongoose, { model, Schema } from "mongoose";
import roleEnum from "../../common/enum/role.enum.js";
import genderEnum from "../../common/enum/gender.enum.js";
import providerEnum from "../../common/enum/provider.enum.js";
import { Globalhash } from "../../common/security/hash.js";

export interface IUser {
  id?: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role?: string;
  age? : number ;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  confirmed?: boolean | undefined;
  provider?: string;
  creadnatials? : Date ;
  deletedAt? : Date ;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required : function():boolean{
        if (this.provider == providerEnum.system) return true 
        else return false
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
      type: String ,
      required : function():boolean{
        if (this.provider == providerEnum.system) return true 
        else return false
      }},
    age: { 
      type: String ,
      required : function():boolean{
        if (this.provider == providerEnum.system) return true 
        else return false
      }},
    confirmed: { type: Boolean, required: true, default: false },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    creadnatials: { type: Date },
    deletedAt : { type : Date }
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


userSchema.pre(['findOne','find'],function(){
  const { paranoid , ...rest } = this.getQuery()
  if ( paranoid == true ){
    this.setQuery({ deleteAt : { $exists : false } , rest })
  }
  else this.setQuery({ rest })
  
})



const userModel = mongoose.models.users || model("users", userSchema);

export default userModel;
