# Quick Start Guide - Advanced Redis Learning

## Setup (5 minutes)

### 1. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
```bash
# Using WSL2 or Docker recommended
docker run -d -p 6379:6379 redis:latest
```

### 2. Verify Redis Installation

```bash
redis-cli ping
# Should return: PONG
```

### 3. Install Project Dependencies

```bash
cd redis-node
npm install
```

### 4. Run the Main Project

```bash
npm start
```

This will test your Redis connection and display all available examples.

---

## Learning Path (2-3 hours)

### Part 1: Fundamentals (30 min)
```bash
npm run basics       # Basic string operations
npm run hashes       # Object storage
npm run lists        # Queue/Stack operations
npm run sets         # Unique collections
```

### Part 2: Practical Patterns (45 min)
```bash
npm run caching      # Cache strategies
npm run sessions     # User session management
npm run transactions # ACID transactions
npm run sorted-sets  # Leaderboards & rankings
```

### Part 3: Advanced Features (45 min)
```bash
npm run pubsub       # Real-time messaging
npm run streams      # Event logs & time-series
npm run hyperloglog  # Unique counting at scale
npm run geospatial   # Location services
```

### Part 4: Operations & Scale (30 min)
```bash
npm run cluster      # Clustering concepts
npm run monitor      # Performance monitoring
```

---

## First Example: Caching Pattern

```javascript
import { createClient } from 'redis';

const client = createClient();
await client.connect();

// Cache-Aside Pattern
async function getUserData(userId) {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    console.log('Cache HIT');
    return JSON.parse(cached);
  }
  
  // Cache miss - fetch from DB
  console.log('Cache MISS - fetching from DB');
  const userData = { id: userId, name: 'John', email: 'john@example.com' };
  
  // Store in cache for 1 hour
  await client.setEx(cacheKey, 3600, JSON.stringify(userData));
  return userData;
}

const data = await getUserData(1);
console.log(data);

await client.quit();
```

---

## Common Commands Cheat Sheet

### Strings
```javascript
await client.set('key', 'value');
await client.get('key');
await client.incr('counter');
await client.expire('key', 60);
```

### Hashes
```javascript
await client.hSet('user:1', { name: 'John', age: '30' });
await client.hGet('user:1', 'name');
await client.hGetAll('user:1');
```

### Lists
```javascript
await client.lPush('queue', 'item1', 'item2');
await client.lPop('queue');
await client.lRange('queue', 0, -1);
```

### Sets
```javascript
await client.sAdd('followers', 'user1', 'user2');
await client.sMembers('followers');
await client.sIsMember('followers', 'user1');
```

### Sorted Sets
```javascript
await client.zAdd('leaderboard', { score: 100, member: 'player1' });
await client.zRevRange('leaderboard', 0, 9);
await client.zScore('leaderboard', 'player1');
```

---

## Debugging Tips

### Check Redis Connection
```bash
redis-cli
> ping
PONG
> keys *
(show all keys)
```

### Monitor Commands
```bash
redis-cli monitor
```

### Check Memory
```bash
redis-cli info memory
```

### Delete All Keys (WARNING!)
```bash
redis-cli FLUSHDB
```

---

## Project Structure

```
redis-node/
├── package.json              # Dependencies
├── index.js                  # Entry point
├── README.md                 # Full documentation
├── QUICKSTART.md             # This file
├── examples/
│   ├── 01-basics.js
│   ├── 02-caching.js
│   ├── 03-sessions.js
│   ├── 04-pubsub.js
│   ├── 05-streams.js
│   ├── 06-sorted-sets.js
│   ├── 07-transactions.js
│   ├── 08-hashes.js
│   ├── 09-lists.js
│   ├── 10-sets.js
│   ├── 11-hyperloglog.js
│   ├── 12-geospatial.js
│   ├── 13-cluster-intro.js
│   └── 14-monitoring.js
└── .gitignore
```

---

## Running Individual Examples

Each example can be run independently:

```bash
# Run specific example
node examples/02-caching.js

# Or use npm script
npm run caching
```

---

## Key Takeaways

1. **Redis is fast** - In-memory data store, microsecond latency
2. **Multiple data types** - Strings, Lists, Sets, Hashes, Sorted Sets, Streams
3. **Expiration** - Automatic data cleanup with TTL
4. **Transactions** - MULTI/EXEC for atomic operations
5. **Pub/Sub** - Real-time message broadcasting
6. **Persistence** - RDB snapshots and AOF logs
7. **Replication** - Master-slave data synchronization
8. **Clustering** - Horizontal scaling with automatic sharding

---

## Next Steps

1. ✅ Complete all 14 examples
2. 📖 Read the [Redis Documentation](https://redis.io/docs/)
3. 🛠️ Build a real project (e.g., session store for your web app)
4. 🚀 Deploy Redis to production (AWS ElastiCache, Redis Cloud)
5. 📊 Monitor performance with tools like RedisInsight

---

## Troubleshooting

### Can't connect to Redis
```bash
# Check if Redis is running
redis-cli ping

# If not running:
redis-server  # Start Redis

# Check port
lsof -i :6379
```

### Module not found errors
```bash
# Reinstall dependencies
npm install
```

### Examples fail with timeout
- Ensure Redis server is running
- Check Redis is on localhost:6379
- Try `redis-cli ping` to verify

---

## Resource Links

- 📚 [Redis Official Docs](https://redis.io/docs/)
- 🔧 [Node Redis Package](https://github.com/redis/node-redis)
- 🎓 [Redis University](https://university.redis.com/)
- 💻 [RedisInsight GUI](https://redis.com/redis-enterprise/redisinsight/)

---

**Ready to dive in? Run `npm start` to get started! 🎉**
