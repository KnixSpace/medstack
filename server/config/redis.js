import { Redis } from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

export const cacheData = async (key, exp, data) =>
  await redis.setex(key, exp, JSON.stringify(data));

export const getCachedData = async (key) => JSON.parse(await redis.get(key));
