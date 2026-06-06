import { commentSchema } from './comments.schema.js';
const CommentSchemaHelpersCalling = () => {
    commentSchema.virtual('replies', {
        ref: 'comment',
        localField: '_id',
        foreignField: 'refId',
    });
};
export default CommentSchemaHelpersCalling;
