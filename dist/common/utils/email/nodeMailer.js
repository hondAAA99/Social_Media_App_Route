import nodemailer from "nodemailer";
import { MAIL_APP_PASSWORD, MAIL_APP_SENDER, } from "../../../config/config.services.js";
import { sendOtp } from "./email.templetes.js";
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: MAIL_APP_SENDER,
        pass: MAIL_APP_PASSWORD,
    },
});
export async function sendMail({ to, subject, data, }) {
    console.log(data);
    await transport.sendMail({
        from: MAIL_APP_SENDER,
        to,
        subject,
        html: sendOtp(data),
    });
}
export const genrateOtp = () => {
    return Math.floor(Math.random() * 100000);
};
