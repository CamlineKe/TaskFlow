import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const initializeRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
  }
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initializeRedis first.');
  }
  return redisClient;
};

// Cache key generators
export const cacheKeys = {
  projectBoard: (projectId: string) => `project:board:${projectId}`,
  projectDetail: (projectId: string) => `project:detail:${projectId}`,
  userProjects: (userId: string) => `user:projects:${userId}`,
  userTasks: (userId: string) => `user:tasks:${userId}`,
};

// Cache TTL in seconds - using environment variables with fallbacks
export const CACHE_TTL = {
  BOARD: Number(process.env.REDIS_TTL_BOARD) || 300, // 5 minutes default
  PROJECT_DETAIL: Number(process.env.REDIS_TTL_PROJECT) || 600, // 10 minutes default
  PROJECT_LIST: Number(process.env.REDIS_TTL_PROJECT_LIST) || 300, // 5 minutes default
  TASK_LIST: Number(process.env.REDIS_TTL_TASKS) || 120, // 2 minutes default
};

// Helper function to get cached data
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

// Helper function to set cached data
export const setCachedData = async <T>(key: string, data: T, ttl: number): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

// Helper function to invalidate cache
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Redis invalidate error:', error);
  }
};

// Helper function to invalidate project-related caches
export const invalidateProjectCaches = async (projectId: string, userId: string): Promise<void> => {
  await Promise.all([
    invalidateCache(cacheKeys.projectBoard(projectId)),
    invalidateCache(cacheKeys.projectDetail(projectId)),
    invalidateCache(cacheKeys.userProjects(userId)),
    invalidateCache('user:tasks:*'), // Invalidate all user task caches
  ]);
};