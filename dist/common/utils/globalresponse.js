export class ErrorResponse extends Error {
    statusCode;
    message;
    constructor({ message, statusCode, }) {
        super(message);
        ((this.message = message), (this.statusCode = statusCode));
    }
}
export const globalErrorHandling = (err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    res.status(status).json({
        status,
        err: err.message,
        stack: err.stack,
    });
};
export const ErrorUnAuthorizedRequest = (message = "you are not authorized to access this page") => {
    throw new ErrorResponse({ message, statusCode: 401 });
};
export const Errorforbidden = (message = "forbidden response due to error when proccessing the request data") => {
    throw new ErrorResponse({ message, statusCode: 403 });
};
export const ErrorNotFound = (message = "failed to find the data") => {
    throw new ErrorResponse({ message, statusCode: 404 });
};
export const ErrorConflict = (message = "conflict") => {
    throw new ErrorResponse({ message, statusCode: 409 });
};
export const ErrorInteralServerError = (message, statusCode = 500) => {
    throw new ErrorResponse({ message, statusCode });
};
export const SuccessResponse = ({ res, statusCode = 200, data, }) => {
    return res.status(statusCode).json(data);
};
