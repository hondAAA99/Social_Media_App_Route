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
  const blockedUser = await new redisServices().getKeyTtl(
    new redisServices().cacheKey({
      filter : to ,
      subject : cacheKeyEnum.block
    })
  )
  if (blockedUser && blockedUser > 0 ) Errorforbidden(`you are being blocked please wait for ${blockedUser}`)

  // check email attempts

  let attempts = await new redisServices().getKey({
    key : new redisServices().cacheKey({
      filter : to ,
      subject : cacheKeyEnum.emailAttempts
    })
  })

  if (!attempts){
    attempts = await new redisServices().setKey({
      key : new redisServices().cacheKey({filter : to , subject : cacheKeyEnum.emailAttempts}),
      value : 0 ,
      ttl : 6*10,
    }) as string
  }

  // incr attempts email
  attempts = await new redisServices().incrKey(new redisServices().cacheKey({filter : to , subject : cacheKeyEnum.emailAttempts}))

  // check attempts number
  if ( attempts as any > 5){
    await new redisServices().setKey({
      key : new redisServices().cacheKey({filter : to , subject : cacheKeyEnum.block  }),
      value : 1 ,
      ttl : 60*10
    })
    Errorforbidden('you are being blocked for 10min')
  }


  await new redisServices().setKey({
    key: new redisServices().cacheKey({ filter: to, subject }),
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
