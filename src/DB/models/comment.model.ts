import mongoose, { Schema } from "mongoose";
import onModelEnum from "../../common/enum/onModel.enum.js";

export interface IComment {
  id: Schema.Types.ObjectId;
  content: string | undefined;
  attachments: string[];
  createdBy: Schema.Types.ObjectId;
  tags: Schema.Types.ObjectId[];
  // replay: Schema.Types.ObjectId[];
  folderId: string;
  refId: Schema.Types.ObjectId;
  onModel: string;
}

const commentSchema = new Schema<IComment>({
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  content: {
    type: String,
    required: function (this) {
      return this.attachments ? false : true;
    },
  },
  attachments: {
    type: [String],
    required: function (this) {
      return this.content ? false : true;
    },
  },
  tags: [{ type: Schema.Types.ObjectId }],
  refId: { type: Schema.Types.ObjectId, refPath: "onModel", required: true },
  onModel: { type: String, enum: onModelEnum, required: true },
});

commentSchema.virtual("replies", {
  ref: "comment",
  localField: "_id",
  foreignField: "refId",
});

const commentModel =
  mongoose.models.messages || mongoose.model("messages", commentSchema);

export default commentModel;
