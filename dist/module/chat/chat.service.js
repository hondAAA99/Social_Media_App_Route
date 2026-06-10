import chatRepo from '../../DB/repo/chat.repo.js';
import { ErrorConflict, SuccessResponse, } from '../../common/utils/globalresponse.js';
import userRepo from '../../DB/repo/user.repo.js';
import redisService from '../../common/services/redis.services.js';
import cacheKeyEnum from '../../common/enum/redis.base.enum.js';
import { Types } from 'mongoose';
import s3services from '../../common/services/s3Services.js';
class chatServices {
    _chatRepo = new chatRepo();
    _userRepo = new userRepo();
    _redisServices = new redisService();
    constructor() { }
    getChat = async (req, res, next) => {
        const { user } = req;
        const { userId } = req.params;
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
        });
        if (!chat) {
            ErrorConflict('failed to find chat between the users');
        }
        SuccessResponse({ res, data: { chat } });
    };
    createGroupChat = async (req, res, next) => {
        const { group, participations } = req.body;
        const mappedUsers = [
            ...new Set(participations.map((pr) => {
                Types.ObjectId.createFromHexString(pr);
            })),
        ];
        const users = await this._userRepo.findAll({
            filter: {
                _id: { $in: mappedUsers },
                'friends.data.': { $in: [req?.user?.id] },
            },
        });
        if (users?.length != mappedUsers.length) {
            return ErrorConflict();
        }
        let groupImage;
        let roomId = Math.floor(Math.random() * 10000);
        if (req?.file) {
            groupImage = await new s3services().uploadFile({
                file: req?.file,
                path: `groups/${roomId}`,
            });
        }
        mappedUsers.push(req?.user.id);
        await this._chatRepo.create({
            group: new String(roomId),
            createdBy: req?.user?.id,
            groupImage,
            participants: mappedUsers,
        });
        SuccessResponse({ res, data: 'created succeded' });
    };
    sendMessage = async (data, socket, io) => {
        const { sendTo, content } = data;
        const createdBy = socket.data.user?.id;
        const user = await this._userRepo.findById({ id: sendTo });
        if (!user) {
            ErrorConflict('unable to find the user');
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
        });
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
            });
        }
        const createdBySockets = await this._redisServices.getSet({
            filter: createdBy,
            subject: cacheKeyEnum.socket,
        });
        const sendToSockets = await this._redisServices.getSet({
            filter: sendTo,
            subject: cacheKeyEnum.socket,
        });
        io.to(createdBySockets).emit('successMessage', { content });
        io.to(sendToSockets).emit('newMessage', { content, from: socket.data.user });
    };
}
export default new chatServices();
