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
        err: err.message,
        status,
        stack: err.stack,
    });
};
