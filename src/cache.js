import NodeCache from 'node-cache';

class Cache {
    static memoryCache = new NodeCache({stdTTL: 5 * 60})

    static set(key, data) {
      try {
        Cache.memoryCache.set(key, data);
        return data;
      } catch (err) {
        console.log('Error', err);
        return data;
      }
    }

    static get(key) {
      const content = Cache.memoryCache.get(key) || null;
      console.log('Cached', content);
      return content;
    }

    static getAndSet(key, data) {
      const content = Cache.get(key);
      if (!content) {
        return Cache.set(key, data);
      }
    }
}

export default Cache;
