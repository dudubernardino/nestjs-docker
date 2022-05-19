import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export default registerAs(
  'redis',
  () =>
    ({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      connectTimeout: process.env.REDIS_CONNECT_TIMEOUT || 5000,
      reconnectOnError: (_) => true,
    } as RedisOptions),
);
