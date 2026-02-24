interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheOptions {
  defaultTTL?: number;
}

export class Cache {
  private store: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.store = new Map();
    this.defaultTTL = options.defaultTTL ?? 300; // 5 minutes default
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ?? this.defaultTTL;
    const expiresAt = Date.now() + ttl * 1000;

    this.store.set(key, {
      value,
      expiresAt,
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  // Clean up expired entries (can be called periodically)
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }

  // Get stats
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance with 5 minute default TTL
export const apiCache = new Cache({ defaultTTL: 300 });
