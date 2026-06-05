import { NextFunction, Request, Response } from 'express'
import chatRepo from '../../DB/repo/chat.repo.js'
import {
  ErrorConflict,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import { Server, Socket } from 'socket.io'
import userRepo from '../../DB/repo/user.repo.js'
import redisService from '../../common/services/redis.services.js'
import cacheKeyEnum from '../../common/enum/cacheKey.enum.js'

class chatServices {
  private readonly _chatRepo = new chatRepo()
  private readonly _userRepo = new userRepo()
  private readonly _redisServices = new redisService()

  constructor() {}

  //rest apis
  getChat = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { userId } = req.params

    const chat = await this._chatRepo.findOne({
      filter: {
        participants: { $all: [user?.id, userId] },
        group: { $exists: false },
      },
      options: {
        populate: [
          {
            path: 'participants',
          },
        ],
      },
    })

    if (!chat) {
      ErrorConflict('failed to find chat between the users')
    }

    SuccessResponse({ res, data: { chat } })
  }

  //socket.io

  sendMessage = async (data: any, socket: Socket, io: Server) => {
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
}

export default new chatServices()
