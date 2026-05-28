import jsonwebtoken from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  SECRET_ADMIN_ACCESS_TOKEN,
  SECRET_ADMIN_REFRESH_TOKEN,
  SECRET_USER_ACCESS_TOKEN,
  SECRET_USER_REFRESH_TOKEN,
} from "../../config/config.services.js";
import { Schema } from "mongoose";
import roleEnum from "../enum/role.enum.js";

export function generateAccessToken({
  userId,
  role,
}: {
  userId: Schema.Types.ObjectId;
  role: string;
}): string {
  return jsonwebtoken.sign(
    { userId, role, id: uuidv4() },
    role == roleEnum.user
      ? SECRET_USER_ACCESS_TOKEN
      : SECRET_ADMIN_ACCESS_TOKEN,
    {
      expiresIn: "10min",
    },
  );
}

export function generateRefreshToken({
  userId,
  role,
}: {
  userId: Schema.Types.ObjectId;
  role: string;
}): string {
  return jsonwebtoken.sign(
    { userId, role, id: uuidv4() },
    role == roleEnum.user
      ? SECRET_USER_REFRESH_TOKEN
      : SECRET_ADMIN_REFRESH_TOKEN,
    {
      expiresIn: "10h",
    },
  );
}
export const TokenVerify = ({
  token,
  secret,
}: {
  token: string;
  secret: string;
}) => {

  return jsonwebtoken.verify(token, secret);
};
