import { ErrorUnAuthorizedRequest } from '../utils/globalresponse.js';
export function authorize(arrOfRoles) {
    return (req, res, next) => {
        const { user } = req;
        authorizeBase_GQL(arrOfRoles, user?.role);
        next();
    };
}
export function authorizeBase_GQL(arrOfRoles, role) {
    if (!arrOfRoles.includes(role)) {
        return ErrorUnAuthorizedRequest('you are not authorized');
    }
}
