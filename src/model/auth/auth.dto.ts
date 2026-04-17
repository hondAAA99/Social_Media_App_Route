import roleEnum from "../../common/enum/role.enum.js";
import genderEnum from "../../common/enum/gender.enum.js";

export type signUpRequestBody = {
  userName: string;
  email: string;
  password: string;
  gender?: string;
  role?: string;
  phone?: string;
};
