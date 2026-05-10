import mongoose, { Schema } from "mongoose";

export interface IComment {
  createdBy: Schema.Types.ObjectId;
  content: string;
  attachments: string[];
  postId: Schema.Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
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
    required: function (this) {
      return this.attachments ? false : true;
    },
    attachments: {
      type: [String],
      required: function (this) {
        return this.content ? false : true;
      },
    },
  },
});

const commentModel =
  mongoose.models.messages || mongoose.model("messages", commentSchema);


  export default commentModel