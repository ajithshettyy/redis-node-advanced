# Advanced Redis Learning Project

A comprehensive Node.js project designed to learn advanced Redis concepts and patterns with practical examples.

## Project Overview

This project covers 14 major Redis topics with working examples, from basic operations to advanced patterns like clustering, geospatial indexing, and stream processing.

## Prerequisites

- Node.js (v16+)
- Redis server running locally (port 6379)
- npm

## Installation

### Option 1: Local Redis Server

```bash
# Install dependencies
npm install

# Start Redis server (if not already running)
redis-server

# Run the main test
npm start
```

### Option 2: Docker (Recommended)

```bash
# Install dependencies
npm install

# Start Redis using Docker Compose
docker compose up -d

# Verify Redis is running
redis-cli ping
# Should return: PONG

# Run the main test
npm start

# Stop Redis when done
docker compose down
```

**Benefits of Docker:**
- ✅ No local Redis installation needed
- ✅ Consistent environment across machines
- ✅ Easy to start/stop
- ✅ Data persistence with volumes
- ✅ Health checks included

For more Docker details, see [DOCKER.md](DOCKER.md)

## Available Examples

### 1. **Basics** (`npm run basics`)
Core Redis string operations and atomic operations:
- SET with options (EX, NX)
- INCR/DECR for atomic counters
- APPEND and substring operations
- MGET/MSET for multiple keys
- TTL management

**Use cases:** Counters, temporary data, sessions

---

### 2. **Caching** (`npm run caching`)
Advanced caching patterns and strategies:
- **Cache-Aside Pattern:** Load data from DB only if missing
- **Write-Through Pattern:** Update cache before DB
- **Write-Behind Pattern:** Async DB writes
- **Cache Stampede Prevention:** Using locks
- **Invalidation Strategies:** TTL and explicit

**Use cases:** Database acceleration, API response caching, expensive computations

---

### 3. **Sessions** (`npm run sessions`)
Session management and user tracking:
- Session storage with TTL
- Session extension/touch
- Active session tracking
- User's multiple sessions
- Session blacklisting on logout
- Session analytics

**Use cases:** User authentication, shopping cart, user state

---

### 4. **Pub/Sub** (`npm run pubsub`)
Real-time publish/subscribe messaging:
- Basic Pub/Sub
- Pattern-based subscriptions
- JSON message publishing
- Channel statistics
- Real-time notifications

**Use cases:** Real-time notifications, chat systems, event broadcasts, live updates

---

### 5. **Streams** (`npm run streams`)
Time-series data and event logs:
- Adding entries to streams
- Range queries
- Consumer groups
- Blocking reads
- Stream trimming
- Real-time monitoring

**Use cases:** Event logging, time-series data, message queues, audit trails

---

### 6. **Sorted Sets** (`npm run sorted-sets`)
Leaderboards, rankings, and scoring:
- Leaderboards with scores
- Rank and score operations
- Time-based rankings
- Priority queues
- Percentile queries
- Set operations (UNION, INTER)

**Use cases:** Leaderboards, rankings, priority queues, top-N queries

---

### 7. **Transactions** (`npm run transactions`)
ACID transactions and atomic operations:
- MULTI/EXEC transactions
- WATCH for optimistic locking
- Pipelining
- Conditional updates
- Lua scripting

**Use cases:** Money transfers, inventory updates, order processing

---

### 8. **Hashes** (`npm run hashes`)
Hash data structure for objects:
- Basic hash operations
- Complex object storage
- Numeric field increments
- Field existence checks
- Batch operations
- Session storage with hashes
- Large hash scanning

**Use cases:** User profiles, object storage, session data, statistics

---

### 9. **Lists** (`npm run lists`)
Lists for queues and stacks:
- FIFO queues
- LIFO stacks
- Range operations
- List trimming
- Message queues
- Activity feeds
- Blocking operations

**Use cases:** Job queues, activity feeds, browser history, task lists

---

### 10. **Sets** (`npm run sets`)
Set operations for unique collections:
- Basic set operations
- Membership checks
- Set intersection/union/difference
- Unique visitor tracking
- Duplicate prevention
- Random selection
- Set operations storage

**Use cases:** Unique visitors, tags, followers, deduplication

---

### 11. **HyperLogLog** (`npm run hyperloglog`)
Probabilistic counting for massive datasets:
- Unique visitor counting
- Memory-efficient tracking
- HyperLogLog merging
- Weekly/daily analytics
- Accuracy vs memory tradeoff

**Use cases:** Unique visitors, API client tracking, search queries, analytics

---

### 12. **Geospatial** (`npm run geospatial`)
Location-based operations:
- Adding geospatial data
- Distance calculations
- Radius searches
- Store locator
- Ride-sharing dispatch
- Route optimization
- Weather station finder

**Use cases:** Maps, ride-sharing, location-based services, delivery optimization

---

### 13. **Cluster** (`npm run cluster`)
Redis clustering for scalability:
- Cluster architecture
- Hash slots and distribution
- Replication strategies
- Failover mechanisms
- Node roles
- Resharding
- Data consistency

**Use cases:** Large-scale deployments, geographic distribution, automatic failover

---

### 14. **Monitoring** (`npm run monitor`)
Performance monitoring and statistics:
- Server information
- Memory statistics
- Connection stats
- Latency measurement
- Keyspace analysis
- Performance benchmarking
- Health checks

**Use cases:** Debugging, performance optimization, operational monitoring

---

## Architecture Concepts

### Key-Value Storage
```javascript
await client.set('key', 'value');
const value = await client.get('key');
```

### Data Structures
1. **Strings** - Simple values, numbers
2. **Lists** - Ordered collections
3. **Sets** - Unique unordered collections
4. **Hashes** - Object-like structures
5. **Sorted Sets** - Collections with scores
6. **Streams** - Event logs
7. **HyperLogLog** - Approximate counting
8. **Geospatial** - Location data

### Expiration & TTL
```javascript
await client.setEx('key', 3600, 'value');  // 1 hour
await client.expire('key', 3600);          // Set TTL
```

### Transactions
```javascript
const tx = client.multi();
tx.set('key1', 'value1');
tx.set('key2', 'value2');
await tx.exec();
```

### Pub/Sub
```javascript
// Subscriber
await subscriber.subscribe('channel', (message) => {
  console.log(message);
});

// Publisher
await client.publish('channel', 'message');
```

## Performance Tips

1. **Pipelining**: Batch multiple commands
   ```javascript
   const tx = client.multi();
   for (let i = 0; i < 100; i++) {
     tx.set(`key:${i}`, `value:${i}`);
   }
   await tx.exec();
   ```

2. **Key Naming**: Use structured patterns
   ```
   user:1000:profile
   user:1000:settings
   post:123:comments
   ```

3. **Expiration**: Always set TTL for temporary data
   ```javascript
   await client.setEx(key, TTL_SECONDS, value);
   ```

4. **Transactions**: Use for atomic operations
   ```javascript
   const tx = client.multi();
   // Multiple operations
   await tx.exec();
   ```

5. **Connection Pooling**: Reuse connections
   ```javascript
   const client = createClient();
   await client.connect();
   ```

## Common Patterns

### Cache-Aside Pattern
```javascript
async function getData(key) {
  let data = await client.get(key);
  if (!data) {
    data = await fetchFromDB();
    await client.set(key, data, { EX: 3600 });
  }
  return data;
}
```

### Rate Limiting
```javascript
async function isRateLimited(userId, limit, window) {
  const key = `rate:${userId}`;
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, window);
  }
  return count > limit;
}
```

### Leaderboard
```javascript
await client.zAdd('leaderboard', { score: points, member: userId });
const top10 = await client.zRevRange('leaderboard', 0, 9, { WITHSCORES: true });
```

### Job Queue
```javascript
// Enqueue
await client.rPush('queue', job);

// Dequeue
const job = await client.lPop('queue');
```

## Best Practices

1. **Connection Management**
   - Always call `await client.quit()` when done
   - Use connection pooling for multiple operations

2. **Error Handling**
   - Handle connection errors
   - Implement retry logic for transient failures

3. **Key Naming Convention**
   - Use namespaces: `module:entity:id:field`
   - Be consistent across application

4. **TTL Management**
   - Set appropriate expiration times
   - Refresh TTL for active sessions

5. **Data Validation**
   - Validate data before storing
   - Handle edge cases

## Redis Configuration

For production use, consider:

```bash
# Maximum memory
maxmemory 4gb

# Eviction policy
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Replication
appendonly yes
appendfsync everysec
```

## Troubleshooting

### Connection Issues
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Check port
lsof -i :6379

# Restart Redis
redis-cli shutdown
redis-server
```

### Performance Issues
```bash
# Check slow queries
redis-cli slowlog get 10

# Monitor commands
redis-cli monitor

# Check memory
redis-cli info memory
```

### Cluster Issues
```bash
# Check cluster status
redis-cli cluster info

# List nodes
redis-cli cluster nodes

# Check slots
redis-cli cluster slots
```

## Running Examples

Each example is self-contained and demonstrates specific Redis concepts:

```bash
npm run basics        # String operations
npm run caching       # Caching patterns
npm run sessions      # Session management
npm run pubsub        # Pub/Sub messaging
npm run streams       # Stream operations
npm run sorted-sets   # Leaderboards
npm run transactions  # ACID transactions
npm run hashes        # Hash structures
npm run lists         # List operations
npm run sets          # Set operations
npm run hyperloglog   # Unique counting
npm run geospatial    # Location services
npm run cluster       # Cluster concepts
npm run monitor       # Monitoring tools
```

## Learning Path

1. Start with **Basics** and **Hashes** for fundamentals
2. Move to **Caching** for practical patterns
3. Learn **Transactions** for consistency
4. Explore **Sorted Sets** for advanced use cases
5. Study **Streams** for event processing
6. Understand **Cluster** for scalability
7. Master **Monitoring** for operations

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [Redis NPM Package](https://github.com/redis/node-redis)
- [Redis Commands Reference](https://redis.io/commands/)
- [Redis Patterns](https://redis.io/patterns/)

## License

MIT

## Contributing

Feel free to add more examples or improve existing ones!

---

**Happy Learning with Redis! 🚀**
