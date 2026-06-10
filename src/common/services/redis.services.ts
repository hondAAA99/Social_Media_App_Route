import { ErrorInternalServerError } from '../utils/globalresponse.js'
import redis, { RedisArgument, RedisClientType } from 'redis'
import { REDIS_CLIENT } from '../../config/config.services.js'
import { Schema } from 'mongoose'

export const _client = redis.createClient({
  url: REDIS_CLIENT,
})
class redisService {
  constructor() {}

  async connect() {
    await _client.connect().then(() => {
      console.log('connected to redis')
    })
  }

  private async keyExists({ key }: { key: RedisArgument }): Promise<number> {
    return await _client.exists(key)
  }

  cacheKey({
    filter,
    subject,
  }: {
    filter: string | Schema.Types.ObjectId
    subject: string
  }): string {
    return `${subject}::${filter}`
  }

  async setKey({
    key,
    value,
    ttl = 60,
  }: {
    key: RedisArgument | any
    value: any | RedisArgument
    ttl: number
  }) {
    try {
      value =
        (typeof value as any) == String ? value : JSON.stringify(value, null, 2)
      return await _client.set(key, value, { EX: ttl })
    } catch (err) {
      ErrorInternalServerError(err)
    }
  }

  async getKey({ key }: { key: string }): Promise<void | string> {
    try {
      const value = await _client.get(key)
      try {
        return JSON.parse(value as string)
      } catch (err) {
        return value as string
      }
    } catch (err) {
      ErrorInternalServerError('failed to get the value from cache')
    }
  }

  async getAllKeys(pattern: RedisArgument): Promise<String[] | any> {
    try {
      const value = await _client.keys(pattern)
      return value
    } catch (err) {
      ErrorInternalServerError(err)
    }
  }

  async deleteKey({ key }: { key: RedisArgument }) {
    try {
      if ((! await this.keyExists({ key }) as unknown as number) > 0) {
        return
      }
      const value = await _client.del(await this.getAllKeys(key))
      return value
    } catch (err) {
      ErrorInternalServerError(err)
    }
  }

  async getKeyTtl(key: RedisArgument) {
    try {
      if ((!this.keyExists({ key }) as unknown as number) > 0) {
        ErrorInternalServerError('key expiered')
      }
      const value = await _client.ttl(key)
      return value
    } catch (err) {
      ErrorInternalServerError(err)
    }
  }

  async incrKey(key: RedisArgument) {
    try {
      await _client.incr(key)
    } catch (err) {
      ErrorInternalServerError(err)
    }
  }

  async addSet(
    { filter, subject }: { filter: string; subject: string },
    members: any,
  ): Promise<number> {
    return await _client.sAdd(
      this.cacheKey({
        filter,
        subject,
      }),
      members,
    )
  }

  async getSet({ filter, subject }: { filter: string; subject: string }) {
    return await _client.sMembers(
      this.cacheKey({
        filter,
        subject,
      }),
    )
  }

  async deleteSet(
    { filter, subject }: { filter: string; subject: string },
    members: any,
  ) {
    return await _client.sRem(
      this.cacheKey({
        filter,
        subject,
      }),
      members,
    )
  }

  async existsSet({ filter, subject }: { filter: string; subject: string }) {
    return await _client.sCard(
      this.cacheKey({
        filter,
        subject,
      }),
    )
  }
}

export default redisService
