import mongoose, { Schema } from "mongoose";
import availabiltyEnum from "../../common/enum/availablity.enum.js";
import reactEnum from "../../common/enum/reactEnum.js";

export interface IPost {
  id: Schema.Types.ObjectId;
  content: string;
  attachments?: string[];
  createdBy: Schema.Types.ObjectId;
  tags?: Schema.Types.ObjectId[];
  allowComments?: string;
  availablity: string;
  folderId: string;
  reactCount: number;
  reactedUsers?: Schema.Types.ObjectId[];
  deletedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
  content: {
    type: String,
    required: function (this) {
      return this.attachments ? false : true;
    },
  },
  attachments: [
    {
      type: String,
      required: function (this) {
        return this.content ? false : true;
      },
    },
  ],
  createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
  tags: [{ type: Schema.Types.ObjectId }],
  allowComments: { type: String, required: true },
  availablity: { type: String, enum: availabiltyEnum, required: true },
  folderId: { type: String, required: true },
  reactCount: { type: Number, default: 0 },
  reactedUsers: [
    {
      type: { userId: Schema.Types.ObjectId, react: Object.values(reactEnum) },
    },
  ],
  deletedAt: { type: Date },
});

postSchema.pre(["findOne", "find"], function () {
  const { paranoid, ...rest } = this.getQuery();
  if (paranoid == true) {
    // soft delete
    this.setQuery({ deleteAt: { $exists: false }, rest });
  } else this.setQuery({ rest });
});

postSchema.pre(
  ["deleteMany", "deleteOne", "findOneAndDelete"],
  async function () {
    const condition = this.getQuery();
    const userId = condition.createdBy;
    await Promise.all([
      mongoose.models.comments!.deleteMany({
        createdBy: userId,
      }),
    ]);
  },
);

postSchema.virtual("comments", {
  ref: "comments",
  localField: "_id",
  foreignField: "refId",
});

const postModel = mongoose.models.posts || mongoose.model("posts", postSchema);

export default postModel;
