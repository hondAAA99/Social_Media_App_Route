import { Server, Socket } from 'socket.io'
import chatEvent from './chat.event.js'

class chatGateWay {
  private readonly _chatEvent = chatEvent
  constructor() {}

  registerEvent = (socket: Socket, io: Server) => {
    this._chatEvent.events(socket, io)
  }
}

export default new chatGateWay()
