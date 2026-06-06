import chatEvent from './chat.event.js';
class chatGateWay {
    _chatEvent = chatEvent;
    constructor() { }
    registerEvent = (socket, io) => {
        this._chatEvent.events(socket, io);
    };
}
export default new chatGateWay();
