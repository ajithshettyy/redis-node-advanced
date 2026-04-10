import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Caching Patterns and Strategies
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== CACHING PATTERNS ===\n');

  // Simulate a database query function
  async function getUserFromDB(userId) {
    console.log(`  📊 Querying database for user ${userId}...`);
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  }

  // 1. Cache-Aside Pattern (Lazy Loading)
  console.log('1. Cache-Aside Pattern:');
  async function getUser(userId) {
    const cacheKey = `user:${userId}`;
    
    // Try cache first
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log(`  ✓ Cache HIT for user ${userId}`);
      return JSON.parse(cached);
    }
    
    console.log(`  ✗ Cache MISS for user ${userId}`);
    // Cache miss - get from database
    const user = await getUserFromDB(userId);
    
    // Store in cache with 1 hour expiration
    await client.setEx(cacheKey, 3600, JSON.stringify(user));
    return user;
  }

  const user1 = await getUser(1);
  console.log(`  First call result: ${user1.name}`);
  
  const user1Again = await getUser(1);
  console.log(`  Second call (cached): ${user1Again.name}\n`);

  // 2. Write-Through Pattern
  console.log('2. Write-Through Pattern:');
  async function updateUserWT(userId, userData) {
    const cacheKey = `user:${userId}`;
    
    // Write to cache first
    await client.setEx(cacheKey, 3600, JSON.stringify(userData));
    console.log(`  ✓ Updated cache for user ${userId}`);
    
    // Then write to database
    console.log(`  📊 Writing to database for user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`  ✓ Database updated`);
    
    return userData;
  }

  await updateUserWT(2, { id: 2, name: 'Jane Doe', email: 'jane@example.com' });

  // 3. Write-Behind Pattern (Fire and Forget)
  console.log('\n3. Write-Behind Pattern (Async):');
  const writeQueue = [];
  
  async function updateUserWB(userId, userData) {
    const cacheKey = `user:${userId}`;
    
    // Write to cache immediately
    await client.setEx(cacheKey, 3600, JSON.stringify(userData));
    console.log(`  ✓ Updated cache for user ${userId}`);
    
    // Queue for async database write
    writeQueue.push({ userId, userData });
    console.log(`  ✓ Queued for database write (async)`);
  }

  await updateUserWB(3, { id: 3, name: 'Bob Smith', email: 'bob@example.com' });

  // 4. Cache Stampede Prevention (using SET with NX)
  console.log('\n4. Cache Stampede Prevention:');
  async function getUserWithLock(userId) {
    const cacheKey = `user:${userId}`;
    const lockKey = `lock:${cacheKey}`;
    
    // Try cache first
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log(`  ✓ Cache HIT`);
      return JSON.parse(cached);
    }
    
    // Try to acquire lock (NX = only if not exists)
    const lock = await client.set(lockKey, '1', { NX: true, EX: 10 });
    
    if (lock) {
      console.log(`  🔒 Lock acquired, fetching from DB...`);
      try {
        const user = await getUserFromDB(userId);
        await client.setEx(cacheKey, 3600, JSON.stringify(user));
        return user;
      } finally {
        await client.del(lockKey);
      }
    } else {
      console.log(`  ⏳ Another request is updating cache, waiting...`);
      // Wait for cache to be populated
      await new Promise(resolve => setTimeout(resolve, 100));
      const cachedUser = await client.get(cacheKey);
      return JSON.parse(cachedUser);
    }
  }

  const user4 = await getUserWithLock(4);
  console.log(`  Result: ${user4.name}`);

  // 5. Cache Invalidation Strategies
  console.log('\n5. Cache Invalidation Patterns:');
  
  // Strategy 1: TTL (Time-based)
  await client.setEx('data:1', 60, 'value1');
  console.log('  ✓ TTL-based invalidation set (60 seconds)');
  
  // Strategy 2: Explicit invalidation
  await client.del('data:1');
  console.log('  ✓ Explicit cache invalidation');
  
  // Strategy 3: Pattern-based (using KEYS - not recommended in production)
  await client.mSet({ 'user:cache:1': 'data', 'user:cache:2': 'data' });
  const keys = await client.keys('user:cache:*');
  await client.del(keys);
  console.log(`  ✓ Pattern-based invalidation (cleared ${keys.length} keys)`);

  console.log('\n=== CACHING PATTERNS COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
