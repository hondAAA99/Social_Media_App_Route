const logger = (req, res, next) => {
    console.log(`${req.method}::${req.ip}::${req.url}`);
    next();
};
export default logger;
