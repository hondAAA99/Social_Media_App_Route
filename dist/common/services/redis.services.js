import { ErrorInternalServerError } from '../utils/globalresponse.js';
import redis from 'redis';
import { REDIS_CLIENT } from '../../config/config.services.js';
export const _client = redis.createClient({
    url: REDIS_CLIENT,
});
class redisService {
    constructor() { }
    async connect() {
        await _client.connect().then(() => {
            console.log('connected to redis');
        });
    }
    async keyExists({ key }) {
        return await _client.exists(key);
    }
    cacheKey({ filter, subject, }) {
        return `${subject}::${filter}`;
    }
    async setKey({ key, value, ttl = 60, }) {
        try {
            value =
                typeof value == String ? value : JSON.stringify(value, null, 2);
            return await _client.set(key, value, { EX: ttl });
        }
        catch (err) {
            ErrorInternalServerError(err);
        }
    }
    async getKey({ key }) {
        try {
            const value = await _client.get(key);
            try {
                return JSON.parse(value);
            }
            catch (err) {
                return value;
            }
        }
        catch (err) {
            ErrorInternalServerError('failed to get the value from cache');
        }
    }
    async getAllKeys(pattern) {
        try {
            const value = await _client.keys(pattern);
            return value;
        }
        catch (err) {
            ErrorInternalServerError(err);
        }
    }
    async deleteKey({ key }) {
        try {
            if (!await this.keyExists({ key }) > 0) {
                return;
            }
            const value = await _client.del(await this.getAllKeys(key));
            return value;
        }
        catch (err) {
            ErrorInternalServerError(err);
        }
    }
    async getKeyTtl(key) {
        try {
            if (!this.keyExists({ key }) > 0) {
                ErrorInternalServerError('key expiered');
            }
            const value = await _client.ttl(key);
            return value;
        }
        catch (err) {
            ErrorInternalServerError(err);
        }
    }
    async incrKey(key) {
        try {
            await _client.incr(key);
        }
        catch (err) {
            ErrorInternalServerError(err);
        }
    }
    async addSet({ filter, subject }, members) {
        return await _client.sAdd(this.cacheKey({
            filter,
            subject,
        }), members);
    }
    async getSet({ filter, subject }) {
        return await _client.sMembers(this.cacheKey({
            filter,
            subject,
        }));
    }
    async deleteSet({ filter, subject }, members) {
        return await _client.sRem(this.cacheKey({
            filter,
            subject,
        }), members);
    }
    async existsSet({ filter, subject }) {
        return await _client.sCard(this.cacheKey({
            filter,
            subject,
        }));
    }
}
export default redisService;
