import { Server } from 'socket.io';
import { authenticateSocket } from '../../common/middleware/authenticate.js';
import { ErrorInteralServerError } from '../../common/utils/globalresponse.js';
import cacheKeyEnum from '../../common/enum/cacheKey.enum.js';
import redisServices from '../../common/services/redis.services.js';
import chatGateWay from '../chat/realtime/chat.gateWay.js';
class socketGateWay {
    io;
    constructor(appServer) {
        this.io = new Server(appServer, {
            cors: {
                origin: '*',
            },
        });
    }
    authenticate = async (socket, next) => {
        try {
            const { user } = await authenticateSocket(socket);
            socket.data.user = user;
            next();
        }
        catch (error) {
            ErrorInteralServerError('error in jwt token');
            next(error);
        }
    };
    connection = async (socket) => {
        await new redisServices().addSet({
            filter: socket.data.user.email.data,
            subject: cacheKeyEnum.socket,
        }, socket.id);
        await chatGateWay.registerEvent(socket, this.io);
        this.io.on('disconnect', async () => await this.disconnection(socket));
    };
    disconnection = async (socket) => {
        await new redisServices().deleteSet({
            filter: socket.data.user.email.data,
            subject: cacheKeyEnum.socket,
        }, socket.id);
    };
    initIo = async () => {
        this.io.use(this.authenticate);
        this.io.on('connection', this.connection);
    };
}
export default socketGateWay;
