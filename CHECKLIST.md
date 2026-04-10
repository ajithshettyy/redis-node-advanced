# Project Checklist & Setup Guide

## ✅ Project Setup Checklist

### Prerequisites
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Redis server (installed or via Docker)

### Installation Steps

```bash
# Step 1: Navigate to project directory
cd /Users/ajithkumarshetty/Documents/Training/redis-node

# Step 2: Install dependencies
npm install

# Step 3: Start Redis server (in another terminal)
redis-server

# Step 4: Verify Redis is running
redis-cli ping
# Expected output: PONG

# Step 5: Test the project
npm start
# You should see: "✓ Connected to Redis"
```

---

## 📋 What You're Learning

### Week 1: Fundamentals
- [ ] Day 1: Basics (strings, expiration, atomic operations)
- [ ] Day 2: Hashes (objects, profiles, statistics)
- [ ] Day 3: Lists (queues, stacks, feeds)
- [ ] Day 4: Sets (unique items, deduplication)
- [ ] Day 5: Review & Practice

### Week 2: Practical Patterns
- [ ] Day 1: Caching (cache-aside, write-through)
- [ ] Day 2: Sessions (authentication, user tracking)
- [ ] Day 3: Transactions (ACID, atomicity)
- [ ] Day 4: Sorted Sets (rankings, leaderboards)
- [ ] Day 5: Review & Mini Project

### Week 3: Advanced Features
- [ ] Day 1: Pub/Sub (real-time messaging)
- [ ] Day 2: Streams (event logs, time-series)
- [ ] Day 3: HyperLogLog (analytics, counting)
- [ ] Day 4: Geospatial (location services)
- [ ] Day 5: Build Project with Multiple Features

### Week 4: Operations & Scale
- [ ] Day 1: Cluster (architecture, scaling)
- [ ] Day 2: Monitoring (performance, debugging)
- [ ] Day 3: Optimization (tuning, best practices)
- [ ] Day 4: Production Setup
- [ ] Day 5: Final Project & Review

---

## 🎯 Daily Learning Routine

### Morning (30 minutes)
1. Read the concept explanation in README.md
2. Review the corresponding example code
3. Run the example: `npm run <topic>`
4. Study the console output

### Afternoon (45 minutes)
1. Modify the example to experiment
2. Try different use cases
3. Compare with alternative approaches
4. Test edge cases

### Evening (30 minutes)
1. Write your own version from scratch
2. Document what you learned
3. Note questions or confusions
4. Plan next day's topics

---

## 🚀 Running Examples

### All Examples Listed

```bash
npm run basics        # String ops, TTL, counters (5 min)
npm run caching       # Cache patterns (5 min)
npm run sessions      # Session mgmt (5 min)
npm run pubsub        # Real-time messaging (5 min)
npm run streams       # Event logs (5 min)
npm run sorted-sets   # Rankings (5 min)
npm run transactions  # ACID operations (5 min)
npm run hashes        # Objects (5 min)
npm run lists         # Queues (5 min)
npm run sets          # Collections (5 min)
npm run hyperloglog   # Analytics (5 min)
npm run geospatial    # Locations (5 min)
npm run cluster       # Scaling (5 min)
npm run monitor       # Performance (5 min)
```

**Total**: ~70 minutes to run all examples

---

## 💻 Redis Setup Instructions

### macOS
```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis

# Check status
brew services list | grep redis
```

### Linux (Ubuntu/Debian)
```bash
# Install Redis
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server

# Check status
sudo systemctl status redis-server
```

### Windows (WSL2 Recommended)
```bash
# Option 1: Using WSL2 + Ubuntu
wsl --install
sudo apt-get install redis-server
redis-server

# Option 2: Using Docker
docker run -d -p 6379:6379 redis:latest
```

### Verify Installation
```bash
redis-cli
> ping
PONG

> set test "hello"
OK

> get test
"hello"

> exit
```

---

## 📚 Key Concepts Summary

### Redis Data Types
1. **String** - Text, numbers, binary data
2. **Hash** - Object-like structures (key → fields)
3. **List** - Ordered collections (FIFO/LIFO)
4. **Set** - Unordered unique collections
5. **Sorted Set** - Collections with scores
6. **Stream** - Event logs with timestamps
7. **HyperLogLog** - Approximate set cardinality
8. **Geospatial** - Location-based data

### Key Operations
- **SET/GET** - Store and retrieve strings
- **HSET/HGET** - Hash operations
- **LPUSH/RPOP** - List operations
- **SADD/SMEMBERS** - Set operations
- **ZADD/ZRANGE** - Sorted set operations
- **XADD/XREAD** - Stream operations

### Expiration
- **EXPIRE** - Set key expiration in seconds
- **SETEX** - Set with expiration in one command
- **TTL** - Get remaining time to live
- **PERSIST** - Remove expiration

### Transactions
- **MULTI** - Start transaction
- **EXEC** - Execute all queued commands
- **DISCARD** - Cancel transaction
- **WATCH** - Optimistic locking

---

## 🔍 Troubleshooting

### Problem: "Cannot connect to Redis"
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis:
redis-server

# Check Redis is listening
lsof -i :6379
```

### Problem: "Module not found: redis"
```bash
# Reinstall dependencies
npm install

# Or if using npm ci (production)
npm ci
```

### Problem: "Connection timeout"
```bash
# Check Redis server status
redis-cli info server

# Check firewall
sudo ufw status  # Linux

# Verify port is correct (default: 6379)
redis-cli -p 6379
```

### Problem: "ERRORONPERM"
```bash
# Redis may need permissions, try:
redis-cli SHUTDOWN
redis-server --daemonize yes
redis-cli ping
```

---

## 📊 Progress Tracking

### Self-Assessment Rubric

After completing each topic, rate yourself:

| Topic | Understand | Can Implement | Can Explain | Ready for Next |
|-------|-----------|--------------|------------|----------------|
| Basics | ⭕ | ⭕ | ⭕ | ⭕ |
| Caching | ⭕ | ⭕ | ⭕ | ⭕ |
| Sessions | ⭕ | ⭕ | ⭕ | ⭕ |
| Pub/Sub | ⭕ | ⭕ | ⭕ | ⭕ |
| Streams | ⭕ | ⭕ | ⭕ | ⭕ |
| Sorted Sets | ⭕ | ⭕ | ⭕ | ⭕ |
| Transactions | ⭕ | ⭕ | ⭕ | ⭕ |
| Hashes | ⭕ | ⭕ | ⭕ | ⭕ |
| Lists | ⭕ | ⭕ | ⭕ | ⭕ |
| Sets | ⭕ | ⭕ | ⭕ | ⭕ |
| HyperLogLog | ⭕ | ⭕ | ⭕ | ⭕ |
| Geospatial | ⭕ | ⭕ | ⭕ | ⭕ |
| Cluster | ⭕ | ⭕ | ⭕ | ⭕ |
| Monitoring | ⭕ | ⭕ | ⭕ | ⭕ |

Legend: ⭕ = Not Started, 🟡 = In Progress, 🟢 = Completed

---

## 🎯 Mini Projects to Build

### Project 1: Cache Layer
**Difficulty**: Easy
**Time**: 2 hours
- Implement cache-aside pattern
- Add cache invalidation
- Measure performance improvement
- Test with simulated DB queries

### Project 2: Session Manager
**Difficulty**: Easy
**Time**: 2 hours
- Build session store
- Implement TTL refresh
- Add logout with blacklist
- Track active sessions

### Project 3: Leaderboard System
**Difficulty**: Medium
**Time**: 3 hours
- Create player rankings
- Update scores atomically
- Get top N players
- Show percentile rankings

### Project 4: Job Queue
**Difficulty**: Medium
**Time**: 3 hours
- Implement queue with lists
- Add job processing
- Handle failures/retries
- Track queue stats

### Project 5: Real-Time Chat
**Difficulty**: Medium
**Time**: 4 hours
- Use Pub/Sub for messaging
- Store chat history
- User presence tracking
- Message notifications

### Project 6: Analytics Dashboard
**Difficulty**: Hard
**Time**: 5 hours
- Track unique visitors (HyperLogLog)
- Time-series events (Streams)
- User segments (Sets)
- Real-time stats (Hashes)

---

## 📞 Getting Help

### Common Resources
1. **Redis Documentation**: https://redis.io/docs/
2. **Node Redis GitHub**: https://github.com/redis/node-redis
3. **Redis Patterns**: https://redis.io/patterns/
4. **Stack Overflow**: Tag: `redis`
5. **Redis Discord**: Official community

### Key Commands Reference
```bash
redis-cli INFO           # Server information
redis-cli DBSIZE         # Total keys
redis-cli FLUSHDB        # Clear all keys (caution!)
redis-cli KEYS pattern   # Find keys matching pattern
redis-cli MONITOR        # Watch all commands
redis-cli SLOWLOG GET    # Slow queries
```

---

## 🎓 Expected Outcomes

After completing this project, you should:

✅ Understand all 8 Redis data structures
✅ Implement caching strategies
✅ Build session management systems
✅ Create real-time applications with Pub/Sub
✅ Process events with Streams
✅ Build leaderboards with Sorted Sets
✅ Implement ACID transactions
✅ Track analytics with HyperLogLog
✅ Build location-based services
✅ Monitor Redis performance
✅ Scale with clustering concepts

---

## 📅 Recommended Schedule

**Total Time**: 4 weeks (20 hours)

- Week 1: Data Structures (5 hours)
- Week 2: Practical Patterns (5 hours)
- Week 3: Advanced Features (5 hours)
- Week 4: Operations & Projects (5 hours)

**Daily Commitment**: 1 hour/day = 4-5 weeks
**Intensive**: 3 hours/day = 1.5-2 weeks

---

## ✨ Success Checklist

- [ ] All 14 examples run successfully
- [ ] Understand each data structure
- [ ] Can explain use cases for each topic
- [ ] Can modify examples to solve new problems
- [ ] Completed at least 2 mini projects
- [ ] Can debug Redis issues
- [ ] Ready to use Redis in production
- [ ] Can explain Redis clustering
- [ ] Can monitor Redis performance
- [ ] Ready to teach others!

---

**Ready to start? Run `npm start` now! 🚀**
