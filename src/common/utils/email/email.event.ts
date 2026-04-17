import { EventEmitter } from "node:events";
import mailEnum from "../../enum/mail.enum.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on(mailEnum.sendMail, (fn: Function) => {
  return fn();
});
