import admin from "firebase-admin";
import { resolve } from "path";
import { readFileSync } from "fs";

class fireBaseServices {
  private _client: admin.app.App = undefined!;
  constructor() {}

  firBaseConnection() {
    if (admin.apps.length) {
      this._client = admin.app(); // reuse existing app
    } else {
      const path = JSON.parse(
        readFileSync(
          resolve(
            "src/config/social-media-app-66b81-firebase-adminsdk-fbsvc-c1dbd34a46.json",
          ),
          "utf-8",
        ),
      );
      this._client = admin.initializeApp({
        credential: admin.credential.cert(path),
      });
    }

    console.log("connected to fireBase");
  }

  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    const message = { token, data };
    return await this._client.messaging().send(message);
  }

  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: {
      title: string;
      body: string;
    };
  }) {
    await Promise.all(
      tokens.map((token) => {
        const message = { token, data };
        this.sendNotification({ token, data });
      }),
    );
  }
}

export default fireBaseServices;
