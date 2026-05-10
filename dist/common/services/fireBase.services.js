import admin from "firebase-admin";
import { resolve } from "path";
import { readFileSync } from "fs";
class fireBaseServices {
    _client;
    constructor() {
        const path = JSON.parse(readFileSync(resolve("src/config/social-media-app-66b81-firebase-adminsdk-fbsvc-c1dbd34a46.json"), "utf-8"));
        this._client = admin.initializeApp({
            credential: admin.credential.cert(path),
        });
        console.log("connected to fireBase");
    }
    async sendNotification({ token, data, }) {
        const message = { token, data };
        return await this._client.messaging().send(message);
    }
    async sendNotifications({ tokens }) {
        const data = {
            title: "login alert",
            body: `there is a device the logged-in to your account in ${Date.now()}`,
        };
        await Promise.all(tokens.map((token) => {
            const message = { token, data };
            this.sendNotification({ token, data });
        }));
    }
}
export default new fireBaseServices();
