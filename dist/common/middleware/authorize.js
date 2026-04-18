import { ErrorUnAuthorizedRequest } from "../utils/globalresponse.js";
export function authorize(arrOfRoles) {
    return (req, res, next) => {
        const { user } = req;
        if (!arrOfRoles.includes(user?.role)) {
            ErrorUnAuthorizedRequest('you are not authorized');
        }
        next();
    };
}
