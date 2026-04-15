import mongoose from "mongoose";
import { DB_URI, DB_NAME } from "../config/config.services.js";
export const DBConnection = mongoose.connect(`${DB_URI}/${DB_NAME}`);
export function checkDataBaseConnection() {
    return DBConnection.then(() => {
        console.log("connected to DataBase");
    }).catch((err) => {
        console.log(err);
    });
}
