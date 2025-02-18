import { Cache } from 'memory-cache';

// Create a singleton cache instance
const globalCache = new Cache();

// Cache duration constants
export const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes

export const cacheUtils = {
  get: (key) => globalCache.get(key),
  set: (key, value, duration = CACHE_DURATION) => globalCache.put(key, value, duration),
  delete: (key) => globalCache.del(key),
  clear: () => globalCache.clear(),
};







