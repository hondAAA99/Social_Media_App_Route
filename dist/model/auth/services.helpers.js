import { generateAccessToken } from "../../common/security/jsonWebTokens.js";
export function generateTokens(user) {
    const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
    });
    const refreshToken = generateAccessToken({
        userId: user.id,
        role: user.role,
    });
    return { accessToken, refreshToken };
}
