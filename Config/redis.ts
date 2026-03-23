import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

const codeQueue = new Queue('code-execution', { 
  connection: redisConfig 
});

export const redisConnection = new Redis(redisConfig);