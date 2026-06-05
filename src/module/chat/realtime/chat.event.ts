import { Server, Socket } from 'socket.io'
import chatServices from '../chat.service.js'

class chatEvent {
  private readonly _chatServices = chatServices
  constructor() {}

  events = (socket: Socket, io: Server) => {
    socket.on(
      'sendMessage',
      async () => await this._chatServices.sendMessage(socket.data, socket, io),
    )
  }
}

export default new chatEvent()
