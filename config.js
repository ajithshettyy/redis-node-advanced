/**
 * Redis Client Configuration
 * Shared configuration for all examples
 */

export const redisConfig = {
  socket: {
    host: 'localhost',
    port: 6379,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
};

/**
 * Error handler for Redis client
 * @param {Error} err - Redis error
 */
export const errorHandler = (err) => {
  console.error('Redis Client Error', err);
};
