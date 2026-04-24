import jsonwebtoken from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_ADMIN_REFRESH_TOKEN, SECRET_USER_ACCESS_TOKEN, SECRET_USER_REFRESH_TOKEN } from "../../config/config.services.js";
import roleEnum from "../enum/role.enum.js";
export function generateAccessToken(data) {
    return jsonwebtoken.sign({
        data,
        id: uuidv4(),
    }, (data.role == roleEnum.user) ? SECRET_USER_ACCESS_TOKEN : SECRET_ADMIN_ACCESS_TOKEN, {
        expiresIn: "10min",
    });
}
export function generateRefreshToken({ data }) {
    return jsonwebtoken.sign({
        data,
        id: uuidv4(),
    }, (data.role == roleEnum.user) ? SECRET_USER_REFRESH_TOKEN : SECRET_ADMIN_REFRESH_TOKEN, {
        expiresIn: "10h",
    });
}
export const accessTokenVerify = ({ token, secret }) => {
    return jsonwebtoken.verify(token, secret);
};
