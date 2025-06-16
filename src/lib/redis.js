import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // from .env
export default redis;
