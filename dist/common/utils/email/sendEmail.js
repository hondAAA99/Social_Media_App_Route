import mailEnum from "../../enum/mail.enum.js";
import { eventEmitter } from "./email.event.js";
import { sendMail } from "./nodeMailer.js";
import redisServices from "../../services/redis.services.js";
import { Globalhash } from "../../security/hash.js";
import cacheKeyEnum from "../../enum/cacheKey.enum.js";
import { Errorforbidden } from "../globalresponse.js";
export const sendEmail = async ({ to, subject, data, }) => {
    const blockedUser = await new redisServices().getKeyTtl(new redisServices().cacheKey({
        filter: to,
        subject: cacheKeyEnum.block
    }));
    if (blockedUser && blockedUser > 0)
        Errorforbidden(`you are being blocked please wait for ${blockedUser}`);
    let attempts = await new redisServices().getKey({
        key: new redisServices().cacheKey({
            filter: to,
            subject: cacheKeyEnum.emailAttempts
        })
    });
    if (!attempts) {
        attempts = await new redisServices().setKey({
            key: new redisServices().cacheKey({ filter: to, subject: cacheKeyEnum.emailAttempts }),
            value: 0,
            ttl: 6 * 10,
        });
    }
    attempts = await new redisServices().incrKey(new redisServices().cacheKey({ filter: to, subject: cacheKeyEnum.emailAttempts }));
    if (attempts > 5) {
        await new redisServices().setKey({
            key: new redisServices().cacheKey({ filter: to, subject: cacheKeyEnum.block }),
            value: 1,
            ttl: 60 * 10
        });
        Errorforbidden('you are being blocked for 10min');
    }
    await new redisServices().setKey({
        key: new redisServices().cacheKey({ filter: to, subject }),
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
