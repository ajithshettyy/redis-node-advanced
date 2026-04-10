import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Redis Cluster Introduction and Concepts
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== REDIS CLUSTER INTRODUCTION ===\n');

  // 1. Understand Cluster Concepts
  console.log('1. Cluster Architecture Overview:');
  console.log('  ✓ Cluster consists of multiple Redis nodes');
  console.log('  ✓ Data is automatically partitioned across nodes');
  console.log('  ✓ Uses consistent hashing with hash slots (0-16383)');
  console.log('  ✓ Each node holds multiple hash slots');
  console.log('  ✓ Supports replication for high availability');

  // 2. Check Server Info (if connected to single Redis)
  console.log('\n2. Server Information:');
  
  const info = await client.info('server');
  const lines = info.split('\r\n');
  
  for (const line of lines) {
    if (line.includes('redis_version') || line.includes('redis_mode')) {
      console.log(`  ✓ ${line}`);
    }
  }

  // 3. Hash Slot Calculation
  console.log('\n3. Hash Slot Calculation:');
  
  function calculateHashSlot(key) {
    // Simplified CRC16 calculation for demo
    // In real cluster, Redis uses CRC16-CCITT polynomial
    const crc = key.charCodeAt(0) % 16384;
    return crc;
  }

  const keys = ['user:1000', 'user:1001', 'product:1', 'order:100'];
  console.log('  Key -> Hash Slot mapping:');
  
  for (const key of keys) {
    const slot = calculateHashSlot(key);
    console.log(`    ${key} -> slot ${slot}`);
  }

  // 4. Replication Strategy
  console.log('\n4. Cluster Replication:');
  console.log('  ✓ Each master has one or more replicas');
  console.log('  ✓ Replicas continuously sync with master');
  console.log('  ✓ If master fails, replica is promoted to master');
  console.log('  ✓ Prevents single point of failure');

  // 5. Cluster Node Roles
  console.log('\n5. Node Roles in Cluster:');
  console.log('  ✓ Master nodes: Store data, handle reads/writes');
  console.log('  ✓ Replica nodes: Replicate master data');
  console.log('  ✓ Cluster topology maintained by all nodes');

  // 6. Key Distribution Strategies
  console.log('\n6. Key Distribution Strategies:');
  
  // Strategy 1: Random Key Distribution
  console.log('  Strategy 1: Random Distribution');
  console.log('    Pros: Even load distribution');
  console.log('    Cons: Related keys may be on different nodes');

  // Strategy 2: Hash Tags for Related Keys
  console.log('  Strategy 2: Hash Tags');
  console.log('    Format: key{tag}');
  console.log('    Example: user:123{profile}:name');
  console.log('    All keys with same tag go to same slot');

  const userKeys = [
    'user:123{id}:name',
    'user:123{id}:email', 
    'user:123{id}:settings'
  ];

  console.log('  Keys with tag {id}:');
  for (const key of userKeys) {
    console.log(`    ${key} -> same slot (can use MULTI/EXEC)`);
  }

  // 7. Cluster Data Operations
  console.log('\n7. Data Operations in Cluster:');
  console.log('  ✓ Single key operations: Direct to slot node');
  console.log('  ✓ Multi-key operations: Keys must be in same slot');
  console.log('  ✓ MGET/MSET: Use hash tags to ensure same slot');
  console.log('  ✓ SCAN: Cluster-aware scanning');

  // 8. Cluster Failover
  console.log('\n8. Failover Mechanism:');
  console.log('  ✓ Nodes send heartbeats to each other');
  console.log('  ✓ If master doesn\'t respond, cluster votes');
  console.log('  ✓ Majority quorum needed for failover');
  console.log('  ✓ Replica with most recent data promoted');
  console.log('  ✓ Client redirected to new master');

  // 9. Cluster Resharding
  console.log('\n9. Cluster Resharding:');
  console.log('  ✓ Add new nodes to cluster');
  console.log('  ✓ Redis redistributes slots to new nodes');
  console.log('  ✓ Can be done online without downtime');
  console.log('  ✓ Data automatically migrated');

  // 10. Cluster Topology
  console.log('\n10. Example Cluster Topology:');
  console.log('  Master 1 (slots 0-5460)');
  console.log('    ├─ Replica 1');
  console.log('  Master 2 (slots 5461-10922)');
  console.log('    ├─ Replica 2');
  console.log('  Master 3 (slots 10923-16383)');
  console.log('    ├─ Replica 3');

  // 11. Partition Tolerance Pattern
  console.log('\n11. Handling Network Partitions:');
  console.log('  ✓ Redis Cluster follows AP (CAP theorem)');
  console.log('  ✓ Availability and Partition tolerance');
  console.log('  ✓ During partition, cannot guarantee consistency');
  console.log('  ✓ Conflict resolution on reconnection');

  // 12. Cluster Limitations
  console.log('\n12. Cluster Limitations:');
  console.log('  ✗ Cannot use MULTI/EXEC across slots');
  console.log('  ✗ Transactions limited to single slot');
  console.log('  ✗ No cross-slot SCAN');
  console.log('  ✗ Pub/Sub doesn\'t work across nodes');

  // 13. Cluster Client Handling
  console.log('\n13. Cluster Client Operations:');
  console.log('  ✓ Client receives cluster topology');
  console.log('  ✓ Client caches node -> slot mapping');
  console.log('  ✓ On redirection (MOVED), updates cache');
  console.log('  ✓ On slot migration (ASK), handles transparently');

  // 14. Performance Considerations
  console.log('\n14. Performance in Cluster:');
  console.log('  ✓ Same speed as single node for single-slot ops');
  console.log('  ✓ Cross-cluster ops require round trips');
  console.log('  ✓ Network latency becomes factor');
  console.log('  ✓ Hash tags minimize cross-cluster operations');

  // 15. Monitoring Cluster
  console.log('\n15. Cluster Monitoring Commands:');
  console.log('  CLUSTER INFO     - General cluster info');
  console.log('  CLUSTER NODES    - List all nodes');
  console.log('  CLUSTER SLOTS    - Slots to nodes mapping');
  console.log('  CLUSTER KEYSLOT  - Which slot a key belongs to');

  // 16. Real-World Cluster Setup Example
  console.log('\n16. Setting Up Redis Cluster:');
  console.log(`  1. Start 6 Redis instances (3 masters, 3 replicas)`);
  console.log(`  2. Run: redis-cli --cluster create <IP:PORT> ...`);
  console.log(`  3. Cluster automatically organizes itself`);
  console.log(`  4. Connect with cluster-aware client library`);

  // 17. Migration Strategy
  console.log('\n17. Scaling Strategy:');
  console.log('  Phase 1: Single Redis node');
  console.log('  Phase 2: Master + replica (replication)');
  console.log('  Phase 3: Cluster (3+ masters for quorum)');
  console.log('  Phase 4: Multi-region cluster');

  // 18. Data Consistency Model
  console.log('\n18. Data Consistency:');
  console.log('  ✓ Strong consistency within single slot');
  console.log('  ✓ Eventual consistency across slots');
  console.log('  ✓ Write to master, sync to replicas');
  console.log('  ✓ After failover, brief inconsistency possible');

  // 19. Cluster Commands Example
  console.log('\n19. Common Cluster Operations:');
  console.log('  await client.clusterInfo()');
  console.log('  await client.clusterNodes()');
  console.log('  await client.clusterSlots()');
  console.log('  await client.clusterKeyslot("mykey")');

  // 20. When to Use Cluster
  console.log('\n20. When to Consider Cluster:');
  console.log('  ✓ Data exceeds single node capacity');
  console.log('  ✓ Need geographic distribution');
  console.log('  ✓ Require automatic failover');
  console.log('  ✓ High throughput requirements');
  console.log('  ✗ Complex multi-key transactions');
  console.log('  ✗ Simple single-node use cases');

  console.log('\n=== CLUSTER INTRODUCTION COMPLETED ===');
  console.log('\nTo run a real cluster:');
  console.log('  1. Install Redis: brew install redis');
  console.log('  2. Use redis-cli --cluster for management');
  console.log('  3. Use redis npm package with cluster support');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
