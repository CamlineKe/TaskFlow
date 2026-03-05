import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

export const initializeRedis = () => {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('⚠️ Upstash Redis credentials not found. Caching disabled.');
      return null;
    }

    redisClient = new Redis({
      url: url,
      token: token,
    });

    console.log('✅ Upstash Redis connected successfully');
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
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

// Helper function to set cached data
export const setCachedData = async <T>(key: string, data: T, ttl: number): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

// Helper function to invalidate cache
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    // Upstash doesn't support KEYS command, so we need to use specific keys
    console.log(`Cache invalidation for pattern: ${pattern} - use specific keys instead`);
  } catch (error) {
    console.error('Redis invalidate error:', error);
  }
};

// Helper function to invalidate project-related caches
export const invalidateProjectCaches = async (projectId: string, userId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    // Delete specific keys instead of using patterns
    await Promise.all([
      client.del(cacheKeys.projectBoard(projectId)),
      client.del(cacheKeys.projectDetail(projectId)),
      client.del(cacheKeys.userProjects(userId)),
      // Note: Can't delete pattern-based keys like 'user:tasks:*' with Upstash REST API
    ]);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};