import mongoose, { Schema } from "mongoose";
import availabiltyEnum from "../../common/enum/availablity.enum.js";

export interface IPost {
  id: Schema.Types.ObjectId;
  content: string;
  attachments?: string[];
  createdBy: Schema.Types.ObjectId;
  tags?: Schema.Types.ObjectId[];
  likes?: Schema.Types.ObjectId[];
  allowComments?: string;
  availablity: string;
  folderId: string;
  reactCount: number;
  reactedUsers?: Schema.Types.ObjectId[];

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

const postModel = mongoose.models.posts || mongoose.model("posts", postSchema);

export default postModel;
