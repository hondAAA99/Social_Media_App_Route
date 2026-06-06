import { Schema } from "mongoose";
const messages = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    content: { type: String, min: 1 },
});
export const chatSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    participants: {
        type: [Schema.Types.ObjectId],
        ref: 'users',
        required: true,
    },
    messages: [messages],
    group: { type: String },
    groupImage: { type: String },
    roomId: { type: String },
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
});
