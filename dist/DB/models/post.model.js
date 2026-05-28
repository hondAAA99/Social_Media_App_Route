import mongoose, { Schema } from "mongoose";
import availabiltyEnum from "../../common/enum/availablity.enum.js";
import hideLikeCount from "../../common/enum/hideLikeCounts.enum.js";
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
    allowComments: { type: String, required: true },
    availablity: { type: String, enum: availabiltyEnum, required: true },
    folderId: { type: String, required: true },
    reacts: {
        type: new Schema({
            reactAviliablity: { type: String, default: hideLikeCount.show },
            reactsCount: {
                type: new Schema({
                    total: { type: Number },
                    like: { type: Number },
                    love: { type: Number },
                    sad: { type: Number },
                    angry: { type: Number },
                    care: { type: Number },
                    wow: { type: Number },
                }),
            },
            reactedUsers: {
                type: [
                    new Schema({
                        userId: Schema.Types.ObjectId,
                        react: String,
                    }),
                ],
            },
        }),
    },
    deletedAt: { type: Date },
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
postSchema.virtual("comments", {
    ref: "comments",
    localField: "_id",
    foreignField: "refId",
});
const postModel = mongoose.models.posts || mongoose.model("posts", postSchema);
export default postModel;
