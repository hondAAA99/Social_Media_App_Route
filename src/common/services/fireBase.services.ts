import admin from "firebase-admin";
import { resolve } from "path";

class fireBaseServices {
  private readonly _client: admin.app.App;
  constructor() {
    const path = JSON.parse(
      resolve("social-media-app-66b81-firebase-adminsdk-fbsvc-9b5231dc47.json"),
    ) as unknown as string;
    this._client = admin.initializeApp({
      credential: admin.credential.cert(path),
    });
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

  async sendNotifications({ tokens }: { tokens: string[] }) {
    const data = {
      title: "login alert",
      body: `there is a device the logged-in to your account in ${Date.now()}`,
    };

    await Promise.all(
      tokens.map((token) => {
        const message = { token , data }
        this.sendNotification({token , data })
      }),
    );
  }
}

export default new fireBaseServices();
