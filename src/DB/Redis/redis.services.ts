    import redisClient from "./redis.connection.js";
    import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
    import { ErrorInteralServerError } from "../../common/utils/globalresponse.js";
    import { RedisArgument } from "redis";
    import { string } from "zod";

    class redisService {
    constructor(private _client = redisClient) {}

    private async keyExists({ key }: { key: RedisArgument }): Promise<number> {
    return await this._client.exists(key);
    }

    cacheKey({
    filter,
    subject,
    }: {
    filter: string;
    subject: string;
    }): string {
    return `${subject}::${filter}`;
    }

    async setKey({
    key,
    value,
    ttl = 60,
    }: {
    key: RedisArgument;
    value: any | RedisArgument;
    ttl: number;
    }) {
    try {
    value =
      (typeof value as any) == string ? value : JSON.stringify(value, null, 2);
    return await this._client.set(key, value, { EX: ttl });
    } catch (err) {
    ErrorInteralServerError(err);
    }
    }

    async getKey({ key }: { key: RedisArgument }): Promise<void | string> {
    try {
    if ((!this.keyExists({ key }) as unknown as number) > 0) {
      ErrorInteralServerError("key expiered");
    }
    const value = await this._client.get(key);
    try {
      return JSON.parse(value as string);
    } catch (err) {
      return value as string;
    }
    } catch (err) {
    ErrorInteralServerError('failed to get the value from cache');
    }
    }

    async getAllKeys(pattern: RedisArgument): Promise<string[] | any> {
    try {
    const value = await this._client.keys(pattern);
    return value;
    } catch (err) {
    ErrorInteralServerError(err);
    }
    }

    async deleteKey({ key }: { key: RedisArgument }){
    try {
    if ((!this.keyExists({ key }) as unknown as number) > 0) {
      return 
    }
    const value = await this._client.del(await this.getAllKeys(key));
    return value;
    } catch (err) {
    ErrorInteralServerError(err);
    }
    }

    async getKeyTtl(key: RedisArgument) {
    try {
    if ((!this.keyExists({ key }) as unknown as number) > 0) {
      ErrorInteralServerError("key expiered");
    }
    const value = await this._client.ttl(key);
    return value;
    } catch (err) {
    ErrorInteralServerError(err);
    }
    }

    async incrKey(key: RedisArgument) {
    try {
    await this._client.incr(key);
    } catch (err) {
    ErrorInteralServerError(err);
    }
    }
    }

    export default new redisService();
