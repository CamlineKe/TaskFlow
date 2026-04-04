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
  BOARD: Number(process.env.REDIS_TTL_BOARD) || 900, // 15 minutes (static board structure)
  PROJECT_DETAIL: Number(process.env.REDIS_TTL_PROJECT) || 600, // 10 minutes
  PROJECT_LIST: Number(process.env.REDIS_TTL_PROJECT_LIST) || 300, // 5 minutes (frequently changes)
  TASK_LIST: Number(process.env.REDIS_TTL_TASKS) || 120, // 2 minutes (tasks change often)
};

// Helper function to get cached data
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    
    if (!data) return null;
    
    // Handle if data is already an object
    if (typeof data === 'object') {
      return data as T;
    }
    
    // Try to parse if it's a string
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return null;
      }
    }
    
    return data as T;
  } catch {
    return null;
  }
};

// Helper function to set cached data
export const setCachedData = async <T>(key: string, data: T, ttl: number): Promise<void> => {
  try {
    const client = getRedisClient();
    const stringData = JSON.stringify(data);
    await client.setex(key, ttl, stringData);
  } catch {
    // Silently fail - cache errors shouldn't break the app
  }
};

// Helper function to invalidate cache - kept for API compatibility
export const invalidateCache = async (_pattern: string): Promise<void> => {
  // Upstash doesn't support pattern-based deletion
  // This function is kept for API compatibility but does nothing
  return Promise.resolve();
};

// Helper function to invalidate project-related caches
export const invalidateProjectCaches = async (projectId: string, userId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    
    await Promise.all([
      client.del(cacheKeys.projectBoard(projectId)),
      client.del(cacheKeys.projectDetail(projectId)),
      client.del(cacheKeys.userProjects(userId)),
    ]);
  } catch {
    // Silently fail - cache errors shouldn't break the app
  }
};