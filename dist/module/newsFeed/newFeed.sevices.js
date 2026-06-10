import userRepo from '../../DB/repo/user.repo.js'
import storyRepo from '../../DB/repo/story.repo.js'
import { friendsFlagEnum } from '../../common/enum/friendsFlag.enum.js'
import { postAvailbilty } from '../../common/utils/postUtils.js'
import postRepo from '../../DB/repo/post.repo.js'
import { SuccessResponse } from '../../common/utils/globalresponse.js'
class newsFeed {
  _userModel = new userRepo()
  _storyModel = new storyRepo()
  _postModel = new postRepo()
  constructor() {}
  getFeed = async (req, res, next) => {
    const { user } = req
    const userFriendsData = await this._userModel.findById({
      id: user.id,
      projection: 'friends.data',
    })
    if (userFriendsData) {
      const userAcceptedFriends = userFriendsData.map(f => {
        return f.flag == friendsFlagEnum.friend ? f.friendId : undefined
      })
      const stories = await this._storyModel.findAll({
        filter: {
          userId: { $in: [...userAcceptedFriends] },
        },
      })
      const posts = await this._postModel.paginate({
        page: Number(req?.query?.page),
        limit: Number(req?.query?.limit),
        search: {
          $or: [...postAvailbilty(req)],
        },
        populate: [
          {
            path: 'comments',
            match: {
              commentId: { $exists: false },
            },
            populate: {
              path: 'replies',
            },
          },
        ],
      })
      SuccessResponse({ res, data: { stories, posts } })
    }
    SuccessResponse({ res, data: 'add friends to see them on feed' })
  }
}
export default new newsFeed()
