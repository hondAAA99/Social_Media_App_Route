import mongoose from 'mongoose';
import { postSchema } from './posts.schema.js';
const postsSchemaHelpersCalling = () => {
    postSchema.pre(['findOne', 'find'], function () {
        const { paranoid, ...rest } = this.getQuery();
        if (paranoid == true) {
            this.setQuery({ deleteAt: { $exists: false }, rest });
        }
        else
            this.setQuery({ rest });
    });
    postSchema.pre(['deleteMany', 'deleteOne', 'findOneAndDelete'], async function () {
        const condition = this.getQuery();
        const userId = condition.createdBy;
        await Promise.all([
            mongoose.models.comments.deleteMany({
                createdBy: userId,
            }),
        ]);
    });
    postSchema.virtual('comments', {
        ref: 'comments',
        localField: '_id',
        foreignField: 'refId',
    });
};
export default postsSchemaHelpersCalling;
