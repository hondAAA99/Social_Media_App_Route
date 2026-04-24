import mailEnum from "../../enum/mail.enum.js";
import { eventEmitter } from "./email.event.js";
import { sendMail } from "./nodeMailer.js";
import redisServices from "../../services/redis.services.js";
import { hash } from "bcrypt";
import { Globalhash } from "../../security/hash.js";
import cacheKeyEnum from "../../enum/cacheKey.enum.js";
import { Errorforbidden } from "../globalresponse.js";

export const sendEmail = async ({
  to,
  subject,
  data,
}: {
  to: string;
  subject: string;
  data: any;
}) => {
  // check blocked email
  const blockedUser = await redisServices.getKeyTtl(
    redisServices.cacheKey({
      filter : to ,
      subject : cacheKeyEnum.block
    })
  )
  if (blockedUser && blockedUser > 0 ) Errorforbidden(`you are being blocked please wait for ${blockedUser}`)

  // check email attempts

  let attempts = await redisServices.getKey({
    key : redisServices.cacheKey({
      filter : to ,
      subject : cacheKeyEnum.emailAttempts
    })
  })

  if (!attempts){
    attempts = await redisServices.setKey({
      key : redisServices.cacheKey({filter : to , subject : cacheKeyEnum.emailAttempts}),
      value : 0 ,
      ttl : 6*10,
    }) as string
  }

  // incr attempts email
  attempts = await redisServices.incrKey(redisServices.cacheKey({filter : to , subject : cacheKeyEnum.emailAttempts}))

  // check attempts number
  if ( attempts as any > 5){
    await redisServices.setKey({
      key : redisServices.cacheKey({filter : to , subject : cacheKeyEnum.block  }),
      value : 1 ,
      ttl : 60*10
    })
    Errorforbidden('you are being blocked for 10min')
  }


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
