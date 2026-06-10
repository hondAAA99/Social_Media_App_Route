import { generateAccessToken, generateRefreshToken, } from '../../common/security/jsonWebTokens.js';
import { eventEmitter } from '../../common/utils/email/email.event.js';
import mailEnum from '../../common/enum/mail.enum.js';
import { sendEmail } from '../../common/utils/email/sendEmail.js';
import userRepo from '../../DB/repo/user.repo.js';
import { ErrorConflict, } from '../../common/utils/globalresponse.js';
import redisService from '../../common/services/redis.services.js';
class servicesHelpers {
    _userModel = new userRepo();
    _redisServices = new redisService();
    generateTokens(user) {
        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
        });
        const refreshToken = generateRefreshToken({
            userId: user.id,
            role: user.role,
        });
        return { accessToken, refreshToken };
    }
    fireMailEvent = (email, mailEnumSubject, data) => {
        eventEmitter.emit(mailEnum.sendMail, async () => {
            await sendEmail({
                to: email,
                subject: mailEnumSubject,
                data,
            });
        });
    };
    checkUserExistsAndConfirmed = async (email, confirmed) => {
        const emailExists = await this._userModel.findOne({
            filter: confirmed == true
                ? { 'email.data': email, confirmed: true }
                : { 'email.data': email },
        });
        if (confirmed == null) {
            if (emailExists)
                return ErrorConflict('email already exists');
        }
        else if (confirmed == false || confirmed == true) {
            if (!emailExists)
                return ErrorConflict('email is not exists exists');
        }
        return emailExists;
    };
    getUserCache = async (email, cacheEnumSubject) => {
        const cache = await this._redisServices.getKey({
            key: this._redisServices.cacheKey({
                filter: email,
                subject: cacheEnumSubject,
            }),
        });
        return cache;
    };
    deleteUserCache = async (email, cacheEnumSubject) => {
        await this._redisServices.deleteKey({
            key: this._redisServices.cacheKey({
                filter: email,
                subject: mailEnum.confirmSingUp,
            }),
        });
    };
}
export default new servicesHelpers();
