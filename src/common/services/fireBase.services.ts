import admin from 'firebase-admin'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { ErrorInternalServerError } from '../utils/globalresponse.js'

let _client: admin.app.App
if (admin.apps.length) {
  _client = admin.app() // reuse existing app
} else {
  const path = JSON.parse(
    readFileSync(
      resolve(
        'src/config/social-media-app-66b81-firebase-adminsdk-fbsvc-c1dbd34a46.json',
      ),
      'utf-8',
    ),
  )
  _client = admin.initializeApp({
    credential: admin.credential.cert(path),
  })
}
class fireBaseServices {
  private = undefined!
  constructor() {}

  async sendNotification({
    token,
    data,
  }: {
    token: string
    data: { title: string; body: string }
  }) {
    const message = { token, data }
    return await _client
      .messaging()
      .send(message)
      .catch(err => {
        return ErrorInternalServerError('failed to send the notification')
      })
  }

  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[]
    data: {
      title: string
      body: string
    }
  }) {
    tokens.map(async token => {
      const message = { token, data }
      await this.sendNotification({ token, data })
    })
  }
}

export default fireBaseServices
