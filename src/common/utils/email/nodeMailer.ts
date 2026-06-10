import nodemailer from 'nodemailer'
import {
  MAIL_APP_PASSWORD,
  MAIL_APP_SENDER,
} from '../../../config/config.services.js'
import mailEnum from '../../enum/mail.enum.js'
import Mail from 'nodemailer/lib/mailer/index.js'
import { sendOtp } from './email.templetes.js'
import { ErrorInternalServerError } from '../globalresponse.js'

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_APP_SENDER,
    pass: MAIL_APP_PASSWORD,
  },
})

export async function sendMail({
  to,
  subject,
  data,
}: {
  to: string
  subject: string
  data: any
}) {
  await transport
    .sendMail({
      from: MAIL_APP_SENDER,
      to,
      subject,
      html: sendOtp(data),
    } as Mail.Options)
    .catch(err => {
      ErrorInternalServerError('error in sending email')
    })
}

export const generateOtp = () => {
  return Math.floor(Math.random() * 100000)
}
