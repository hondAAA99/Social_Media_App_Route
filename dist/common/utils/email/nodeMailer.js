import nodemailer from 'nodemailer';
import { MAIL_APP_PASSWORD, MAIL_APP_SENDER, } from '../../../config/config.services.js';
import { sendOtp } from './email.templetes.js';
import { ErrorInternalServerError } from '../globalresponse.js';
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MAIL_APP_SENDER,
        pass: MAIL_APP_PASSWORD,
    },
});
export async function sendMail({ to, subject, data, }) {
    await transport
        .sendMail({
        from: MAIL_APP_SENDER,
        to,
        subject,
        html: sendOtp(data),
    })
        .catch(err => {
        ErrorInternalServerError('error in sending email');
    });
}
export const generateOtp = () => {
    return Math.floor(Math.random() * 100000);
};
