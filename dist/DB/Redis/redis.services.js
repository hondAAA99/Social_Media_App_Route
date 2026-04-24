import redisClient from "./redis.connection.js";
import { ErrorInteralServerError } from "../../common/utils/globalresponse.js";
class redisService {
    _client;
    constructor(_client = redisClient) {
        this._client = _client;
    }
    async keyExists({ key }) {
        return await this._client.exists(key);
    }
    cacheKey({ filter, subject, }) {
        return `${subject}::${filter}`;
    }
    async setKey({ key, value, ttl = 60, }) {
        try {
            value =
                typeof value == string ? value : JSON.stringify(value, null, 2);
            return await this._client.set(key, value, { EX: ttl });
        }
        catch (err) {
            ErrorInteralServerError(err);
        }
    }
    async getKey({ key }) {
        try {
            if (!this.keyExists({ key }) > 0) {
                ErrorInteralServerError("key expiered");
            }
            const value = await this._client.get(key);
            try {
                return JSON.parse(value);
            }
            catch (err) {
                return value;
            }
        }
        catch (err) {
            ErrorInteralServerError('failed to get the value from cache');
        }
    }
    async getAllKeys(pattern) {
        try {
            const value = await this._client.keys(pattern);
            return value;
        }
        catch (err) {
            ErrorInteralServerError(err);
        }
    }
    async deleteKey({ key }) {
        try {
            if (!this.keyExists({ key }) > 0) {
                return;
            }
            const value = await this._client.del(await this.getAllKeys(key));
            return value;
        }
        catch (err) {
            ErrorInteralServerError(err);
        }
    }
    async getKeyTtl(key) {
        try {
            if (!this.keyExists({ key }) > 0) {
                ErrorInteralServerError("key expiered");
            }
            const value = await this._client.ttl(key);
            return value;
        }
        catch (err) {
            ErrorInteralServerError(err);
        }
    }
    async incrKey(key) {
        try {
            await this._client.incr(key);
        }
        catch (err) {
            ErrorInteralServerError(err);
        }
    }
}
export default new redisService();
