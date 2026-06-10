import { commentSchema } from './comments.schema.js';
const CommentSchemaHelpersCalling = () => {
    commentSchema.virtual('replies', {
        ref: 'comment',
        localField: '_id',
        foreignField: 'refId',
    });
    commentSchema.pre(['findOne', 'find'], function () {
        const query = this.getQuery();
        const { paranoid, ...rest } = query;
        if (paranoid && paranoid === true) {
            this.setQuery({ deletedAt: { $exists: false }, ...rest });
        }
        else {
            this.setQuery({ ...rest });
        }
    });
};
export default CommentSchemaHelpersCalling;
