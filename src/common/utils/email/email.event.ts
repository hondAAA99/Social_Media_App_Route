import { EventEmitter } from "nodemailer/lib/xoauth2/index.js";
import mailEnum from "../../enum/mail.enum.js";

export const eventEmitter = new EventEmitter();

eventEmitter.emit(mailEnum.sendMail, (fn: Function) => {
  return fn();
});
