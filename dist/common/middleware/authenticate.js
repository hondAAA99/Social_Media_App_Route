import authenticateUtilts from '../utils/authentication.utils.js';
export async function authenticate(req, res, next) {
    let { authorization } = req.headers;
    const { user, token, decoded } = await authenticateUtilts(authorization);
    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded;
    next();
}
export async function authenticateGQL(context) {
    let { authorization } = context.req.headers;
    const { user, token, decoded } = await authenticateUtilts(authorization);
    return {
        user,
        token,
        decoded,
    };
}
export async function authenticateSocket(socket) {
    const { authorization } = socket.handshake.auth.authorization ||
        socket.handshake.headers.authorization;
    const { user, token, decoded } = await authenticateUtilts(authorization);
    return { user, token, decoded };
}
