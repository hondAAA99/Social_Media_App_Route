import redis from "redis";
import { REDIS_CLIENT } from "../../config/config.services.js";
import { ErrorInteralServerError } from "../../common/utils/globalresponse.js";
const redisClient = redis.createClient({
    url: REDIS_CLIENT,
});
try {
    await redisClient.connect();
    console.log('connected to redis');
}
catch (err) {
    ErrorInteralServerError("error when connecting to redis");
}
export default redisClient;
