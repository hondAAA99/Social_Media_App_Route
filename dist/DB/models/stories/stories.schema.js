import { Schema } from 'mongoose';
import availabiltyEnum from '../../../common/enum/availablity.enum.js';
const storyViewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    viewDate: { type: Date, required: true },
});
export const storySchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    url: { type: String },
    text: { type: String },
    backGroundColor: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    expiresAt: { type: Number, required: true },
    excludeUsers: { type: [Schema.Types.ObjectId], },
    views: { type: [storyViewSchema], ref: 'users' },
    availability: {
        type: String,
        enum: Object.values(availabiltyEnum),
        default: availabiltyEnum.public,
        required: true,
    },
});
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });
