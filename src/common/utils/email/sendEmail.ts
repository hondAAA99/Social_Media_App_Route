import mailEnum from "../../enum/mail.enum.js";
import { eventEmitter } from "./email.event.js";
import { sendMail } from "./nodeMailer.js";

export const sendEmail = async ({
  to,
  subject,
  data,
}: {
  to: string;
  subject: string;
  data?: any;
}) => {
  eventEmitter.on(mailEnum.sendMail, async () => {
    await sendMail({
      to,
      subject,
      data,
    });
  });
};
