import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV;

config({ path: resolve(`.env.${NODE_ENV}`) });

export const PORT = Number(process.env.PORT);
export const HOST = process.env.HOST;
export const DB_URI = process.env.DB_URI as string;
export const DB_NAME = process.env.DB_NAME as string;
export const HASH_SALT = process.env.HASH_SALT as string;
export const ENCRYPTION_ALGORITM = process.env.ENCRYPTION_ALGORITM as string;
export const CIPHER_IV_SIZE = Number(process.env.CIPHER_IV_SIZE);
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const MAIL_APP_PASSWORD = process.env.MAIL_APP_PASSWORD as string;
export const MAIL_APP_SENDER = process.env.MAIL_APP_SENDER as string;
