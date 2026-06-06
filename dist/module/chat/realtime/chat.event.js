import chatServices from '../chat.service.js';
class chatEvent {
    _chatServices = chatServices;
    constructor() { }
    events = (socket, io) => {
        socket.on('sendMessage', async () => await this._chatServices.sendMessage(socket.data, socket, io));
    };
}
export default new chatEvent();
