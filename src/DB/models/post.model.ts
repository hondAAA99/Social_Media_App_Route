import mongoose from "mongoose";
import availabiltyEnum from "../../common/enum/availablity.enum.js";

export interface IPost {
  content: string;
  attachments?: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  tags?: mongoose.Schema.Types.ObjectId[];
  likes?: mongoose.Types.ObjectId[];
  allowComments?: string;
  availablity: string;
  folderId: string;
}

const postSchema = new mongoose.Schema<IPost>({
  content: { type: String },
  attachments: { type: String },
  createdBy: { type: mongoose.Types.ObjectId },
  tags: [{ type: mongoose.Types.ObjectId }],
  likes: [{ type: mongoose.Types.ObjectId }],
  allowComments: { type: String },
  availablity: { type: String, enum: availabiltyEnum },
  folderId: { type: String },
});

postSchema.pre(["findOne", "find"], function () {
  const { paranoid, ...rest } = this.getQuery();
  if (paranoid == true) { // soft delete
    this.setQuery({ deleteAt: { $exists: false }, rest });
  } else this.setQuery({ rest });
});

const postModel = mongoose.models.posts || mongoose.model("posts", postSchema);

export default postModel;
