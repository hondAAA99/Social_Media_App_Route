import mongoose, { model, Schema } from 'mongoose';
const storySchema = new Schema({
    id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    url: { type: String },
    createdAt: { type: Date },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
});
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });
const storyModel = mongoose.models.stories || model('stories', storySchema);
export default storyModel;
