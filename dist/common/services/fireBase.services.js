import admin from 'firebase-admin';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { ErrorInternalServerError } from '../utils/globalresponse.js';
let _client;
if (admin.apps.length) {
    _client = admin.app();
}
else {
    const path = JSON.parse(readFileSync(resolve('src/config/social-media-app-66b81-firebase-adminsdk-fbsvc-c1dbd34a46.json'), 'utf-8'));
    _client = admin.initializeApp({
        credential: admin.credential.cert(path),
    });
}
class fireBaseServices {
    private = undefined;
    constructor() { }
    async sendNotification({ token, data, }) {
        const message = { token, data };
        return await _client
            .messaging()
            .send(message)
            .catch(err => {
            return ErrorInternalServerError('failed to send the notification');
        });
    }
    async sendNotifications({ tokens, data, }) {
        tokens.map(async (token) => {
            const message = { token, data };
            await this.sendNotification({ token, data });
        });
    }
}
export default fireBaseServices;
