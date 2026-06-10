import { NextFunction, Request, Response } from 'express'
import chatRepo from '../../DB/repo/chat.repo.js'
import {
  ErrorConflict,
  ErrorInternalServerError,
  ErrorNotFound,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import { Server, Socket } from 'socket.io'
import userRepo from '../../DB/repo/user.repo.js'
import redisService from '../../common/services/redis.services.js'
import cacheKeyEnum from '../../common/enum/redis.base.enum.js'
import { HydrateOptions, Types } from 'mongoose'
import s3services from '../../common/services/s3Services.js'
import { create } from 'node:domain'

class chatServices {
  private readonly _chatRepo = new chatRepo()
  private readonly _userRepo = new userRepo()
  private readonly _redisServices = new redisService()
  private readonly _s3services = new s3services()

  constructor() {}

  //rest apis
  getChat = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { userId } = req.params
    let { page, limit }: { page: number; limit: number } =
      req.query as unknown as {
        page: number
        limit: number
      }
    page = Number(page) < 0 || !page ? (page = 1) : page
    limit = Number(limit) < 0 || !limit ? (limit = 5) : limit

    const chat = await this._chatRepo.findOne({
      filter: {
        participants: { $all: [user?.id, userId] },
        group: { $exists: false },
        projection: {
          $slice: [-(page * limit), limit],
        },
        options: {
          populate: [
            {
              path: 'participants',
            },
          ],
        },
      },
    })

    if (!chat) {
      ErrorConflict('failed to find chat between the users')
    }

    SuccessResponse({ res, data: { chat } })
  }

  getGrpupChat = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { roomId } = req.params
    let { page, limit }: { page: number; limit: number } =
      req.query as unknown as {
        page: number
        limit: number
      }
    page = Number(page) < 0 || !page ? (page = 1) : page
    limit = Number(limit) < 0 || !limit ? (limit = 5) : limit

    const chat = await this._chatRepo.findOne({
      filter: {
        roomId,
        participants: { $all: [user?.id] },
        group: { $exists: true },
        projection: {
          // $slice: [-(page * limit), limit],
        },
        options: {
          populate: [
            {
              path: 'messages.createdBy',
            },
          ],
        },
      },
    })

    if (!chat) {
      ErrorConflict('failed to find chat between the users')
    }

    SuccessResponse({ res, data: { chat } })
  }

  createChat = async (req: Request, res: Response, next: NextFunction) => {
    let { group, participants, groupImage } = req.body
    const { createdBy } = req?.user?.id as any
    const partiMap = participants.map((pr: string) => {
      return Types.ObjectId.createFromHexString(pr)
    })

    const users = await this._userRepo.findAll({
      filter: {
        id: {
          $in: partiMap,
        },
        friends: {
          $in: [createdBy],
        },
      },
    })

    if (users?.length != partiMap) {
      ErrorConflict('there is some users not exists in the db')
    }

    let groupPath =
      group.replaceAll(/\s+/g.dotAll, '-') + Math.floor(Math.random() * 10000)
    partiMap.push(createdBy)
    if (groupImage) {
      groupImage = await this._s3services.uploadFile({
        file: groupImage,
        path: `chat/${groupPath}`,
      })
    }

    try {
      const chat = await this._chatRepo.create({
        group,
        groupImage,
        participants,
        createdBy,
        messages: [],
        roomId: groupPath,
      })
    } catch (err) {
      await this._s3services.deleteFile({ Key: groupPath })
      return ErrorInternalServerError('failed to create group')
    }

    SuccessResponse({ res, data: 'chat created' })
  }

  //socket.io

  sendMessageToFriend = async (data: any, socket: Socket, io: Server) => {
    const { sendTo, content } = data
    const createdBy = socket.data.user?.id

    const user = await this._userRepo.findById({ id: sendTo })
    if (!user) {
      ErrorConflict('unable to find the user')
    }

    const chat = await this._chatRepo.findOneAndUpdate({
      filter: {
        participants: { $all: [sendTo, createdBy] },
        group: { $exists: false },
      },
      update: {
        $push: {
          messages: {
            createdBy,
            content,
          },
        },
      },
    })

    if (!chat) {
      await this._chatRepo.create({
        participants: [sendTo, createdBy],
        createdBy,
        messages: [
          {
            createdBy,
            content,
          },
        ],
      })
    }

    const createdBySockets = await this._redisServices.getSet({
      filter: createdBy,
      subject: cacheKeyEnum.socket,
    })
    const sendToSockets = await this._redisServices.getSet({
      filter: sendTo,
      subject: cacheKeyEnum.socket,
    })
    io.to(createdBySockets).emit('successMessage', { content })
    io.to(sendToSockets).emit('newMessage', { content, from: socket.data.user })
  }

  joinRoom = async (data: any, socket: Socket, io: Server) => {
    const { roomId, userId } = data
    const chat = await this._chatRepo.findOne({
      filter: {
        group: { $exists: true },
        participants: { $in: [userId] },
        roomId,
      },
    })

    if (!chat) return ErrorNotFound('group not found')
    socket.join(roomId)
  }

  sendGroupMessage = async (data: any, socket: Socket, io: Server) => {
    const { content, groupId, userId } = data

    const chat = await this._chatRepo.findOneAndUpdate({
      filter: {
        id: groupId,
        participants: { $in: [userId] },
        group: { $exists: true },
      },
      update: {
        $push: {
          messages: {
            createdBy: userId,
            content,
          },
        },
      },
      options: {
        returnDocument: 'after',
      },
    })

    if (!chat) return ErrorNotFound('group not found')
    io.to(socket.id).emit('successMessage', { content })
    io.to(chat?.roomId).emit('successMessage', { content, from: userId , groupId})
  }
}

export default new chatServices()
