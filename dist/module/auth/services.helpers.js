import { generateAccessToken, generateRefreshToken } from "../../common/security/jsonWebTokens.js";
export function generateTokens(user) {
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
