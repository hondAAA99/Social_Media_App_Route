import userRepo from '../../DB/repo/user.repo.js';
import { ErrorConflict, ErrorNotFound, ErrorUnAuthorizedRequest, SuccessResponse, } from '../../common/utils/globalresponse.js';
import redisServices from '../../common/services/redis.services.js';
import { GlobalCompare, Globalhash } from '../../common/security/hash.js';
import cacheKeyEnum from '../../common/enum/redis.base.enum.js';
import s3Services from '../../common/services/s3Services.js';
import postRepo from '../../DB/repo/post.repo.js';
import { Globalencrypt } from '../../common/security/encrypt.js';
import availabiltyEnum from '../../common/enum/availablity.enum.js';
import fireBaseServices from '../../common/services/fireBase.services.js';
import { sendEmail } from '../../common/utils/email/sendEmail.js';
import mailEnum from '../../common/enum/mail.enum.js';
import storyRepo from '../../DB/repo/story.repo.js';
import { blockUserEnum, friendsFlagEnum, friendsRequestEnum, } from '../../common/enum/user.base.enum.js';
import { isUserBlocked } from './services.helpers.js';
import { generateOtp } from '../../common/utils/email/nodeMailer.js';
import servicesHelpers from '../auth/services.helpers.js';
class userServices {
    _userModel = new userRepo();
    _redisServices = new redisServices();
    _s3services = new s3Services();
    _postModel = new postRepo();
    _storyModel = new storyRepo();
    _fireBase = new fireBaseServices();
    constructor() { }
    lockProfile = async (req, res, next) => {
        const { user } = req;
        const { flag } = req.query;
        if (user?.profileLock && flag == 'lock') {
            return ErrorConflict('the profile is already locked');
        }
        else if (!user?.profileLock && flag == 'unlock') {
            return ErrorConflict('the profile is already unlocked');
        }
        await this._userModel.findByIdAndUpdate({
            id: user?.id,
            update: {
                profileLock: flag == 'lock' ? true : false,
            },
        });
        SuccessResponse({ res, data: 'user data updated' });
    };
    ShareProfile = async (req, res, next) => {
        const { user } = req;
        console.log(user);
        const { userId } = req.params;
        const isFriend = user?.friends?.data.find(fr => {
            return fr.friendId.toString() == userId?.toString();
        });
        const sharedUser = await this._userModel.findOne({
            filter: {
                id: userId,
            },
        });
        isUserBlocked(sharedUser, user.id);
        const canShow = (avail) => {
            return (avail == availabiltyEnum.friends && isFriend) ||
                avail == availabiltyEnum.public
                ? true
                : false;
        };
        const Data = {
            profileLock: sharedUser.profileLock,
            userName: sharedUser.userName,
            firstName: sharedUser.firstName,
            lastName: sharedUser.lastName,
            profilePicture: sharedUser.profilePicture,
            email: canShow(sharedUser?.email?.availability)
                ? sharedUser.email.data
                : undefined,
            phone: canShow(sharedUser?.phone?.availability)
                ? sharedUser.phone.data
                : undefined,
            age: canShow(sharedUser?.age?.availability)
                ? sharedUser.age.data
                : undefined,
            gender: canShow(sharedUser?.gender?.availability)
                ? sharedUser.gender.data
                : undefined,
            friends: canShow(sharedUser?.friends?.availability)
                ? sharedUser.friends.data
                : undefined,
        };
        console.log(sharedUser);
        SuccessResponse({
            res,
            data: Data
        });
    };
    getUserProfile = async (req, res, next) => {
        const { profileLock, userName, profilePicture, email, friends, phone, age, gender, } = req.user;
        SuccessResponse({
            res,
            data: {
                profileLock,
                userName,
                profilePicture,
                email,
                friends,
                phone,
                age,
                gender,
            },
        });
    };
    updateProfile = async (req, res, next) => {
        const { firstName, lastName, age, gender, phone } = req.body;
        const { file } = req;
        const { user } = req.body;
        await this._userModel.findByIdAndUpdate({
            id: user?.id,
            update: {
                firstName,
                lastName,
                'age.data': age?.data,
                'age.availability': age?.availability,
                'gender.data': gender?.data,
                'gender.availability': gender?.availability,
                'phone.data': Globalencrypt({ plainText: phone?.data }),
                'phone.availability': phone?.availability,
                profilePicture: file
                    ? await this._s3services.uploadFile({
                        file: req.file,
                        path: `user/${user.email}/profile-photo`,
                    })
                    : undefined,
            },
        });
        SuccessResponse({ res, data: 'user updated' });
    };
    updatePassword = async (req, res, next) => {
        const { oldPassword, passwordSchema } = req.body;
        const { user } = req;
        console.log({ plainText: oldPassword, hashText: user.password });
        if (!GlobalCompare({ plainText: oldPassword, hashText: user.password }))
            ErrorUnAuthorizedRequest('passwords does not match');
        await this._userModel.findOneAndUpdate({
            filter: { email: user.email, confirmed: true },
            update: { password: Globalhash({ plainText: passwordSchema.password }) },
        });
        SuccessResponse({ res, data: 'password updated' });
    };
    updateEmail = async (req, res, next) => {
        const { user } = req;
        const { email } = req.body;
        const emailExists = await this._userModel.findOne({
            filter: {
                'email.data': email,
            },
        });
        if (emailExists)
            return ErrorNotFound('email is used by another user');
        await sendEmail({
            to: email,
            subject: mailEnum.confirmSingUp,
            data: generateOtp(),
        });
        SuccessResponse({ res, data: 'please confirm the email' });
    };
    updateEmailconfirmation = async (req, res, next) => {
        const { user } = req;
        const { email, otp } = req.body;
        const emailExists = await this._userModel.findOne({
            filter: {
                'email.data': email,
            },
        });
        if (emailExists)
            return ErrorNotFound('email is used by another user');
        const cached = (await servicesHelpers.getUserCache(email, cacheKeyEnum.confirmSingUp));
        if (!GlobalCompare({ plainText: otp, hashText: cached }))
            user.email.data = email;
        await user?.save();
        SuccessResponse({ res, data: 'email updated' });
    };
    deleteUser = async (req, res, next) => {
        const { user } = req;
        user.deletedAt = new Date();
        user.deletedBy = user._id;
        await user.save();
        SuccessResponse({ res, data: 'user deleted' });
    };
    logout = async (req, res, next) => {
        const { flag } = req.query;
        const { user } = req;
        if (flag == 'all') {
            user.credentials = new Date(Date.now());
            user.save();
            await this._redisServices.deleteKey({
                key: this._redisServices.cacheKey({
                    filter: user.email.data,
                    subject: cacheKeyEnum.revokeToken,
                }),
            });
            SuccessResponse({ res, data: 'logout succeded from all devices' });
        }
        await this._redisServices.setKey({
            key: this._redisServices.cacheKey({
                filter: req.token,
                subject: cacheKeyEnum.revokeToken,
            }),
            value: user.email,
            ttl: Date.now() - req.tokenDecoded.iat * 1000,
        });
        SuccessResponse({ res, data: 'logout succeded' });
    };
    sendFriendRequest = async (req, res, next) => {
        const { user } = req;
        const { requestedUserId } = req.params;
        const requestedUser = await this._userModel.findById({
            id: requestedUserId,
        });
        isUserBlocked(requestedUser, user.id);
        if (!requestedUser)
            return ErrorNotFound('requested user not found');
        requestedUser?.friends.data.push({
            friendId: user?.id,
            flag: friendsFlagEnum.requested,
        });
        await requestedUser?.save();
        const cachedFCM = await this._redisServices.getSet({
            filter: user?.email.data,
            subject: cacheKeyEnum.fcm,
        });
        if (cachedFCM) {
            this._fireBase.sendNotifications({
                tokens: cachedFCM,
                data: {
                    title: 'friend request',
                    body: `${user?.userName} sent friend request`,
                },
            });
        }
        SuccessResponse({ res, data: 'request has been sent' });
    };
    handleFriendRequest = async (req, res, next) => {
        const { user } = req;
        const { requestingUserId, flag } = req.params;
        const requestingUser = await this._userModel.findById({
            id: requestingUserId,
        });
        if (!requestingUserId)
            return ErrorNotFound('requested user not found');
        if (flag == friendsRequestEnum.accept ||
            flag == friendsRequestEnum.reject) {
            user?.friends.data.map((f) => {
                return f.friendId == requestingUserId
                    ? flag == friendsRequestEnum.accept
                        ? (f.flag = friendsFlagEnum.reject)
                        : user?.friends.data.slice(user?.friends.data.findIndex((fr) => {
                            return fr.friendId == requestingUserId;
                        }), 1)
                    : null;
            });
        }
        if (flag == friendsRequestEnum.accept) {
            const cachedFCMS = await this._redisServices.getSet({
                filter: requestingUser.email?.data,
                subject: cacheKeyEnum.fcm,
            });
            if (cachedFCMS) {
                this._fireBase.sendNotifications({
                    tokens: cachedFCMS,
                    data: {
                        title: `friend request update`,
                        body: `${user?.userName} accept your frined request`,
                    },
                });
            }
        }
        SuccessResponse({ res, data: 'done' });
    };
    removeFriend = async (req, res, next) => {
        const { user } = req;
        const { removedFriendId } = req.params;
        const removedUser = await this._userModel.findById({ id: removedFriendId });
        if (!removedUser)
            ErrorNotFound('user not Found');
        user?.friends.data.map((f) => {
            if (f.friendId == removedFriendId) {
                user?.friends.data.slice(user?.friends.data.findIndex((fr) => {
                    return fr.friendId == removedFriendId;
                }), 1);
            }
        });
        await user?.save();
        removedUser?.friends.data.map((f) => {
            if (f.friendId == user?.id) {
                removedUser?.friends.data.slice(removedUser?.friends.data.findIndex((fr) => {
                    return fr.friendId == user?.id;
                }), 1);
            }
        });
        await removedUser?.save();
        SuccessResponse({ res, data: 'user has been removed' });
    };
    blockHandling = async (req, res, next) => {
        const query = req.query;
        const { user } = req;
        const blockedUser = await this._userModel.findById({
            id: query.blockedUserId,
        });
        if (!blockedUser)
            return ErrorNotFound('user not found');
        if (query.flag == blockUserEnum.block &&
            !user?.blockedUsers.map((b) => {
                return query.blockedUserId;
            })) {
            user?.blockedUsers.push(query.blockedUserId);
        }
        else if (query.flag == blockUserEnum.unBlock &&
            user?.blockedUsers.map((b) => {
                return query.blockedUserId;
            })) {
            user?.blockedUsers.slice(user?.blockedUsers.findIndex((b) => {
                return query.blockedUserId;
            }), 1);
        }
        SuccessResponse({ res, data: 'operation done' });
    };
    freezeProfile = () => { };
    restartProfile = () => { };
}
export default new userServices();
