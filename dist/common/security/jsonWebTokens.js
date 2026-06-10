import jsonwebtoken from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_ADMIN_REFRESH_TOKEN, SECRET_USER_ACCESS_TOKEN, SECRET_USER_REFRESH_TOKEN, } from '../../config/config.services.js';
import { roleEnum } from '../enum/user.base.enum.js';
export function generateAccessToken({ userId, role, }) {
    return jsonwebtoken.sign({ userId, role, id: uuidv4() }, role == roleEnum.user
        ? SECRET_USER_ACCESS_TOKEN
        : SECRET_ADMIN_ACCESS_TOKEN, {
        expiresIn: '10min',
    });
}
export function generateRefreshToken({ userId, role, }) {
    return jsonwebtoken.sign({ userId, role, id: uuidv4() }, role == roleEnum.user
        ? SECRET_USER_REFRESH_TOKEN
        : SECRET_ADMIN_REFRESH_TOKEN, {
        expiresIn: '10h',
    });
}
export const TokenVerify = ({ token, secret, }) => {
    return jsonwebtoken.verify(token, secret);
};
