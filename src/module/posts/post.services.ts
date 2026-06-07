import { NextFunction, Request, Response } from 'express'
import {
  ErrorConflict,
  ErrorInteralServerError,
  ErrorNotFound,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import postRepo from '../../DB/repo/post.repo.js'
import { createPostDTO, deletePostDTO, updatePostDTO } from './post.dto.js'
import userRepo from '../../DB/repo/user.repo.js'
import redisServices from '../../common/services/redis.services.js'
import cacheKeyEnum from '../../common/enum/redis.base.enum.js'
import s3Services from '../../common/services/s3Services.js'
import { randomUUID } from 'crypto'
import { HydratedDocument, ObjectId, Schema } from 'mongoose'
import fireBaseServices from '../../common/services/fireBase.services.js'
import { postAvailability, searchQuery } from '../../common/utils/postUtils.js'
import { IPost } from '../../DB/models/posts/post.interface.js'
import { roleEnum } from '../../common/enum/user.base.enum.js'

class postServices {
  private readonly _postModel = new postRepo()
  private readonly _userModel = new userRepo()
  private readonly _redisServices = new redisServices()
  private readonly _s3Service = new s3Services()
  private readonly _fireBase = new fireBaseServices()
  constructor() {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const {
      availability,
      content,
      tags,
      allowComments,
      hideLikeCount,
    }: createPostDTO = req.body
    const { user } = req
    let mentionsArr
    let fcmArr: string[] = []

    const mentions: Schema.Types.ObjectId[] = []

    if ((tags! as Array<any>).length) {
      mentionsArr = await this._userModel.findAll({
        filter: {
          _id: { $in: tags },
        },
      })

      if (mentionsArr && (tags! as Array<any>).length !== mentionsArr!.length) {
        ErrorConflict('invalid tags')
      }

      mentionsArr?.map(async mention => {
        mentions.push(mention.id)
        ;(
          await this._redisServices.getSet({
            filter: user!.email.data,
            subject: cacheKeyEnum.fcm,
          })
        ).map((token: string) => {
          fcmArr.push(token)
        })
      })

      const folderId = randomUUID()
      const Keys = await this._s3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${user?.email}/posts/${folderId}`,
      })

      const post = await this._postModel.create({
        content: content as string,
        availability,
        tags: mentions,
        attachments: Keys,
        allowComments,
        createdBy: req?.user!.id,
        folderId,
      })

      if (!post) {
        await this._s3Service.deleteFiles({
          Keys,
        })
        ErrorInteralServerError('failed to create post')
      }

      await this._fireBase.sendNotifications({
        tokens: fcmArr,
        data: {
          title: `${user?.userName} updated their post`,
          body: `${user?.userName} mentioned you in a post`,
        },
      })

      post.reacts.reactavailability = hideLikeCount

      SuccessResponse({ res, data: post })
    }
  }

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const posts = await this._postModel.paginate({
      page: Number(req?.query?.page!),
      limit: Number(req?.query?.limit!),
      search: {
        $or: [...postAvailability(req), searchQuery(req)],
        deletedBy: { $exists: false },
        deletedAt: { $exists: false },
      },
      options: {
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
      },
    })

    SuccessResponse({ res, data: posts })
  }

  reactPost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params
    const { flag } = req.query
    const { user } = req
    const post: HydratedDocument<IPost> = await this._postModel.findById({
      id: postId,
    })
    if (!post) return ErrorNotFound('post not found')

    const reactedUser = post.reacts.reactedUsers.find(fr => {
      return fr.userId.toString() == user?.id.toString() ? fr : null
    })

    if (!reactedUser) {
      const reactPath = `reacts.reactsCount.${flag}`
      await this._postModel.findByIdAndUpdate({
        id: postId,
        update: {
          $inc: { reactPath: 1, 'reacts.reactsCount.total': 1 },
        },
      })
      post.reacts.reactedUsers.push({
        userId: user?.id!,
        react: flag as string,
      })
      await post.save()
    } else {
      if (reactedUser.react == flag) {
        let flagPath = `reacts.reactedUsers.${flag}`
        await this._postModel.findOneAndUpdate({
          filter: {
            id: postId,
            availablity: { $or: [postAvailability(req)] },
          },
          update: {
            $pull: { 'reacts.reactedUsers': reactedUser },
            'reacts.reactsCount.total': { $dec: 1 },
            flagPath: { $dec: 1 },
          },
        })
      } else {
        await this._postModel.findOneAndUpdate({
          filter: {
            id: postId,
            availablity: { $in: [postAvailability(req)] },
            'reacts.reactedUser.userId': user.id,
          },
          update: {
            'reacts.reactedUser.$.react': flag,
            $inc: {
              [`reacts.reactsCount.${reactedUser.react}`]: -1,
              [`reacts.reactsCount.${reactedUser.react}`]: 1,
            },
            newflagPath: { $inc: 1 },
            oldflagPath: { $dec: 1 },
          },
        })
      }
    }

    SuccessResponse({ res, data: 'like!' })
  }

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params
    const { user } = req
    const {
      allowComment,
      availability,
      content,
      tags,
      removeFiles,
      removeTags,
      hideLikeCount,
    } = req.body

    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        createdBy: req?.user?.id!,
      },
    })

    if (!post) {
      ErrorConflict('posy not found or not authorized')
    }

    if (removeFiles?.length) {
      const inValidFiles = removeFiles.filter((file: string) => {
        return !post?.attachments?.includes(file)
      })

      if (inValidFiles?.length) {
        ErrorConflict('some of path file you want remove not exist')
      }

      await this._s3Service.deleteFiles({ Keys: removeFiles })

      post!.attachments = post?.attachments?.filter((file: string) => {
        return !removeFiles.includes(file)
      }) as string[]
    }

    const updateTags = new Set(post?.tags?.map(id => id.toString()))

    ;(removeTags as Array<string>).forEach((tag: string) => {
      return updateTags.delete(tag)
    })

    let fcms_token: string[] = []
    if ((tags as Array<string>).length!) {
      const mentionsTags = await this._userModel.findAll({
        filter: {
          _id: { $in: tags },
        },
      })

      if ((tags as Array<string>).length! !== mentionsTags!.length) {
        ErrorConflict('some person you mentioned not found')
      }

      for (const tag of mentionsTags!) {
        if (tag._id.toString() == req.user?._id.toString()) {
          ErrorConflict('you can not mention tou your self')
        }
        updateTags.add(tag._id.toString())
        ;(
          await this._redisServices.getSet({
            filter: req?.user?.email.data!,
            subject: cacheKeyEnum.fcm,
          })
        ).map(token => {
          fcms_token.push(token)
        })
      }
    }

    const newTags = updateTags.map(
      (id: string) => new Schema.Types.ObjectId(id),
    )

    if (fcms_token?.length) {
      await this._fireBase.sendNotifications({
        tokens: fcms_token,
        data: {
          title: `${user?.userName} updated their post`,
          body: `${user?.userName} mentioned you in a post`,
        },
      })
    }

    if (content) post!.content = content
    if (availability) post!.availability = availability
    if (allowComment) post!.allowComments = allowComment
    if (hideLikeCount) post!.reacts.reactavailability = hideLikeCount

    await post!.save()

    SuccessResponse({ res, data: ' post updated' })
  }

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { postId } = req.params as deletePostDTO

    const post = await this._postModel.findOneAndUpdate({
      filter:
        user?.role == roleEnum.admin
          ? {
              id: postId as unknown as ObjectId,
            }
          : {
              id: postId as unknown as ObjectId,
              createdBy: user?.id as ObjectId,
            },
      update: {
        deleteBy: user?.id,
        deletedAt: new Date(),
      },
      options: {
        returnDocument: 'after',
      },
    })

    if (!post) return ErrorConflict('there is no post to be updated')
    await this._s3Service.deleteFolder({
      folderKey: `users/${user?.email}/posts/${post?.value!.folderId}`,
    })

    SuccessResponse({ res, data: 'post deleted' })
  }
}

export default new postServices()
