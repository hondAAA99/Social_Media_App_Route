import mongoose, { model, Schema } from 'mongoose'
import { userSchema } from './users.schema.js'


const userModel = mongoose.models.users || model('users', userSchema)

export default userModel
