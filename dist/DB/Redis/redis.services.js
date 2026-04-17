import redisClient from "./redis.connection.js";
import { ErrorInteralServerError } from "../../common/utils/globalresponse.js";
import { string } from "zod";
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
        value =
            typeof value == string ? value : JSON.stringify(value, null, 2);
        return await this._client.set(key, value, { EX: ttl }).catch((err) => {
            ErrorInteralServerError(err);
        });
    }
    async getKey({ key }) {
        if (!this.keyExists({ key }) > 0) {
            ErrorInteralServerError("key expiered");
        }
        try {
            const value = await this._client
                .get(key);
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
        await this._client
            .keys(pattern)
            .then((value) => {
            return value;
        })
            .catch((err) => {
            ErrorInteralServerError(err);
        });
    }
    async deleteKey({ key }) {
        if (!this.keyExists({ key }) > 0) {
            ErrorInteralServerError("key expiered");
        }
        await this._client
            .del(await this.getAllKeys(key))
            .then((value) => {
            return value;
        })
            .catch((err) => {
            ErrorInteralServerError(err);
        });
    }
    async getKeyTtl(key) {
        if (!this.keyExists({ key }) > 0) {
            ErrorInteralServerError("key expiered");
        }
        await this._client
            .ttl(key)
            .then((value) => {
            return value;
        })
            .catch((err) => {
            ErrorInteralServerError(err);
        });
    }
    async incrKey(key) {
        await this._client.incr(key).catch((err) => {
            ErrorInteralServerError(err);
        });
    }
}
export default new redisService();
