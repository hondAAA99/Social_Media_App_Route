import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV;

config({ path: resolve(`.env.${NODE_ENV}`) });

export const PORT = Number(process.env.PORT)
