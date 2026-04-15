import userModel from "../../DB/models/user.model.js";
import { ErrorConflict, SuccessResponse } from "../../common/globalresponse.js";
import repoBase from "../../DB/repo/repo.base.js";
class auth {
    _userModel = new repoBase(userModel);
    constructor() { }
    signUp = async (req, res, next) => {
        const { userName, email, password, phone, gender, role, } = req.body;
        const emailExists = await this._userModel.userEmailExists(email);
        if (emailExists) {
            ErrorConflict("email already exists");
        }
        const user = await this._userModel.create({
            userName,
            email,
            password,
            phone,
            gender,
            role,
        });
        SuccessResponse({ res, data: user });
    };
    confirmMail = async (req, res, next) => { };
    signUpWithGmail = async (req, res, next) => { };
    signIn = async (req, res, next) => { };
    signInWithGmail = async (req, res, next) => { };
    forgetPassword = async (req, res, next) => { };
    async updatePassword(req, res, next) { }
    async logOut(req, res, next) { }
}
export default new auth();
