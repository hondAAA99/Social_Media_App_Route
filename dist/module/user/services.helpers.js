import { ErrorNotFound, ErrorUnAuthorizedRequest } from '../../common/utils/globalresponse.js';
export const isUserBlocked = (user, blockedId) => {
    if (!user)
        return ErrorNotFound('user not found');
    const checkBlocking = user.blockedUsers?.map(blId => {
        return blId == blockedId;
    });
    if (checkBlocking)
        ErrorUnAuthorizedRequest('due to blocking user');
};
