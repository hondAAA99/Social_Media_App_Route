import mailEnum from "../../enum/mail.enum.js";
import { eventEmitter } from "./email.event.js";
import { sendMail } from "./nodeMailer.js";
import redisServices from "../../../DB/Redis/redis.services.js";
import { hash } from "bcrypt";
import { Globalhash } from "../../security/hash.js";

export const sendEmail = async ({
  to,
  subject,
  data,
}: {
  to: string;
  subject: string;
  data: any;
}) => {
  await redisServices.setKey({
    key: redisServices.cacheKey({ filter: to, subject }),
    value: subject == "otp" ? Globalhash({ plainText: `${data}` }) : data,
    ttl: 60 * 5,
  });
  // send it to the mail
  eventEmitter.emit(mailEnum.sendMail, async () => {
    await sendMail({
      to,
      subject,
      data,
    });
  });
};
