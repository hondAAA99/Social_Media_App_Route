import { string } from "zod";
import { generateAccessToken, generateRefreshToken } from "../../common/security/jsonWebTokens.js";
import { IUser } from "../../DB/models/user.model.js";
import { HydratedDocument, StringExpression } from "mongoose";

export function generateTokens(user: HydratedDocument<IUser>): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken: string = generateAccessToken({
    userId: user.id,
    role: user.role,
  } as any);
  const refreshToken: string = generateRefreshToken({
    userId: user.id,
    role: user.role,
  } as any);

  return { accessToken, refreshToken };
}
