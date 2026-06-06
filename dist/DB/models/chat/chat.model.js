import mongoose from "mongoose";
import { model } from "mongoose";
import { chatSchema } from "./chat.schema.js";
const chatModel = mongoose.models.chats || model('chats', chatSchema);
export default chatModel;
