import mongoose, { Schema } from "mongoose";
import availabiltyEnum from "../../common/enum/availablity.enum.js";
const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: function () {
            return this.attachments ? false : true;
        },
    },
    attachments: [
        {
            type: String,
            required: function () {
                return this.content ? false : true;
            },
        },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    tags: [{ type: Schema.Types.ObjectId }],
    likes: [{ type: Schema.Types.ObjectId }],
    allowComments: { type: String, required: true },
    availablity: { type: String, enum: availabiltyEnum, required: true },
    folderId: { type: String, required: true },
    reactCount: { type: Number, default: 0 },
    reactedUsers: [{ type: Schema.Types.ObjectId }],
});
postSchema.pre(["findOne", "find"], function () {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid == true) {
        this.setQuery({ deleteAt: { $exists: false }, rest });
    }
    else
        this.setQuery({ rest });
});
postSchema.pre(["deleteMany", "deleteOne", "findOneAndDelete"], async function () {
    const condition = this.getQuery();
    const userId = condition.createdBy;
    await Promise.all([
        mongoose.models.comments.deleteMany({
            createdBy: userId,
        }),
    ]);
});
const postModel = mongoose.models.posts || mongoose.model("posts", postSchema);
export default postModel;
