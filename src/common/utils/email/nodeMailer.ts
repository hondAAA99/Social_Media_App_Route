import nodemailer from "nodemailer";
import {
  MAIL_APP_PASSWORD,
  MAIL_APP_SENDER,
} from "../../../config/config.services.js";
import mailEnum from "../../enum/mail.enum.js";
import Mail from "nodemailer/lib/mailer/index.js";
import { sendOtp } from "./email.templetes.js";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohanaddata4@gmail.com",
    pass: MAIL_APP_PASSWORD,
  },
});

const generateOtp = Math.random() * 100000 * 9;

export async function sendMail({
  to,
  subject,
  data,
}: {
  to: string;
  subject: string;
  data?: any;
}) {
  const emailhtml = () => {
    if (subject == mailEnum.consrimSingUp) {
      return sendOtp(generateOtp);
    }
  };
  await transport.sendMail({
    from: MAIL_APP_SENDER,
    to,
    subject,
    html: emailhtml,
  } as Mail.Options);
}
