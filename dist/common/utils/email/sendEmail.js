import mailEnum from "../../enum/mail.enum.js";
import { eventEmitter } from "./email.event.js";
import { sendMail } from "./nodeMailer.js";
import redisServices from "../../../DB/Redis/redis.services.js";
import { Globalhash } from "../../security/hash.js";
export const sendEmail = async ({ to, subject, data, }) => {
    await redisServices.setKey({
        key: redisServices.cacheKey({ filter: to, subject }),
        value: subject == "otp" ? Globalhash({ plainText: `${data}` }) : data,
        ttl: 60 * 5,
    });
    eventEmitter.emit(mailEnum.sendMail, async () => {
        await sendMail({
            to,
            subject,
            data,
        });
    });
};
