import mongoose, { Schema } from "mongoose";
const commentSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users",
    },
    postId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "posts",
    },
    content: {
        type: String,
        required: function () {
            return this.attachments ? false : true;
        },
    },
    attachments: {
        type: [String],
        required: function () {
            return this.content ? false : true;
        },
    },
    tags: [{ type: Schema.Types.ObjectId }],
    replay: [{ type: Schema.Types.ObjectId }],
});
const commentModel = mongoose.models.messages || mongoose.model("messages", commentSchema);
export default commentModel;
