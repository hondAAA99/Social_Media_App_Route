import { authenticateGQL } from '../../../common/middleware/authenticate.js';
import postRepo from '../../../DB/repo/post.repo.js';
import { GQLCommentType } from './types.js';
import { postAvailbilty } from '../../../common/utils/postUtils.js';
class GLCommentFields {
    constructor() { }
    getComments = () => {
        return {
            type: GQLCommentType,
            resolve: async (parent, args, context) => {
                const { user } = authenticateGQL(context);
                const { postId } = args;
                const comments = await new postRepo().findAll({
                    filter: {
                        id: postId,
                        availablity: {
                            $or: [...postAvailbilty(context.req)],
                        },
                    },
                    options: {
                        populate: {
                            path: 'comments',
                            match: {
                                commentId: { $exists: false },
                            },
                            populate: {
                                path: 'replies',
                            },
                        },
                    },
                });
                return comments;
            },
        };
    };
}
export default new GLCommentFields();
