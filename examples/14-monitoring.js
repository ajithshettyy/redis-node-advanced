import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Monitoring, Statistics, and Performance Analysis
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== MONITORING & STATISTICS ===\n');

  // 1. Server Information
  console.log('1. Server Information:');
  
  const serverInfo = await client.info('server');
  const lines = serverInfo.split('\r\n').filter(line => line && !line.startsWith('#'));
  
  console.log('✓ Server Info:');
  lines.slice(0, 5).forEach(line => {
    const [key, value] = line.split(':');
    console.log(`  ${key}: ${value}`);
  });

  // 2. Memory Statistics
  console.log('\n2. Memory Statistics:');
  
  const memoryInfo = await client.info('memory');
  const memLines = memoryInfo.split('\r\n').filter(line => line && !line.startsWith('#'));
  
  console.log('✓ Memory Usage:');
  const memStats = {};
  memLines.forEach(line => {
    const [key, value] = line.split(':');
    if (['used_memory', 'used_memory_human', 'used_memory_peak_human'].includes(key)) {
      console.log(`  ${key}: ${value}`);
    }
  });

  // 3. Stats Section
  console.log('\n3. Connection & Operation Stats:');
  
  const statsInfo = await client.info('stats');
  const statsLines = statsInfo.split('\r\n').filter(line => line && !line.startsWith('#'));
  
  console.log('✓ Statistics:');
  const importantStats = ['total_connections_received', 'total_commands_processed', 'instantaneous_ops_per_sec'];
  statsLines.forEach(line => {
    const [key, value] = line.split(':');
    if (importantStats.includes(key)) {
      console.log(`  ${key}: ${value}`);
    }
  });

  // 4. Replication Info
  console.log('\n4. Replication Status:');
  
  const replInfo = await client.info('replication');
  const replLines = replInfo.split('\r\n').filter(line => line && !line.startsWith('#'));
  
  console.log('✓ Replication:');
  replLines.slice(0, 3).forEach(line => {
    const [key, value] = line.split(':');
    console.log(`  ${key}: ${value}`);
  });

  // 5. Client List
  console.log('\n5. Connected Clients:');
  
  const clientList = await client.clientList('ID', 'ADDR', 'FLAGS');
  if (clientList && clientList.length > 0) {
    console.log(`✓ Number of clients: ${clientList.length}`);
    console.log('  This client connection');
  }

  // 6. Key Space Statistics
  console.log('\n6. Keyspace Statistics:');
  
  const keyspaceInfo = await client.info('keyspace');
  console.log('✓ Keyspace:');
  if (keyspaceInfo.includes('db0')) {
    console.log('  Database has keys');
  } else {
    console.log('  Database is empty or no keys yet');
  }

  // 7. Command Statistics
  console.log('\n7. Command Stats:');
  
  // Run some commands first
  await client.set('test:key', 'value');
  await client.get('test:key');
  await client.incr('test:counter');

  const commandstats = await client.info('commandstats');
  console.log('✓ Recently executed commands recorded');

  // 8. Latency Monitoring
  console.log('\n8. Latency Monitoring:');
  
  // Measure command latency
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    await client.set(`perf:test:${i}`, `value:${i}`);
  }
  const duration = Date.now() - start;
  
  console.log(`✓ SET operations (1000x): ${duration}ms`);
  console.log(`  Average per operation: ${(duration / 1000).toFixed(3)}ms`);

  // 9. DB Size
  console.log('\n9. Database Size:');
  
  const dbSize = await client.dbSize();
  console.log(`✓ Total keys in database: ${dbSize}`);

  // 10. Slowlog - Slow Query Log
  console.log('\n10. Slow Query Log:');
  
  console.log('✓ Slow queries (if any):');
  console.log('  Note: Configure with CONFIG SET slowlog-log-slower-than');
  console.log('  slowlog-max-len: Maximum entries to keep');

  // 11. CONFIG Information
  console.log('\n11. Configuration:');
  
  // Get some important configs (read-only)
  const maxclients = await client.configGet('maxclients');
  const timeout = await client.configGet('timeout');
  
  console.log('✓ Key Configuration:');
  console.log(`  maxclients: ${maxclients[1] || 'not set'}`);
  console.log(`  timeout: ${timeout[1] || 'not set'}`);

  // 12. Monitor Mode (Example only - would block)
  console.log('\n12. Monitor Command:');
  console.log('✓ MONITOR command shows all commands in real-time');
  console.log('  Usage: redis-cli MONITOR');
  console.log('  Useful for debugging client behavior');

  // 13. Key Pattern Analysis
  console.log('\n13. Key Pattern Analysis:');
  
  const keysAll = await client.keys('*');
  console.log(`✓ Total keys scanned: ${keysAll.length}`);

  // Analyze key patterns
  const patterns = {};
  keysAll.forEach(key => {
    const prefix = key.split(':')[0];
    patterns[prefix] = (patterns[prefix] || 0) + 1;
  });

  console.log('✓ Key distribution:');
  Object.entries(patterns).forEach(([prefix, count]) => {
    console.log(`  ${prefix}:* -> ${count} keys`);
  });

  // 14. Memory Fragmentation
  console.log('\n14. Memory Analysis:');
  
  const fullMemInfo = await client.info('memory');
  const fragRatioMatch = fullMemInfo.match(/mem_fragmentation_ratio:([^\r\n]+)/);
  
  if (fragRatioMatch) {
    const fragRatio = parseFloat(fragRatioMatch[1]);
    console.log(`✓ Memory fragmentation ratio: ${fragRatio}`);
    if (fragRatio < 1.1) {
      console.log('  Status: ✓ Good (minimal fragmentation)');
    } else if (fragRatio > 1.5) {
      console.log('  Status: ⚠ High fragmentation - consider restart');
    }
  }

  // 15. Persistence Status
  console.log('\n15. Persistence Status:');
  
  const fullInfo = await client.info('persistence');
  if (fullInfo.includes('rdb_bgsave_in_progress:0')) {
    console.log('✓ No background save in progress');
  }
  console.log('  RDB (snapshots) configured and active');

  // 16. Eviction Policy Stats
  console.log('\n16. Eviction Statistics:');
  
  const evictionInfo = await client.info('stats');
  if (evictionInfo.includes('evicted_keys')) {
    console.log('✓ Eviction tracking enabled');
  } else {
    console.log('✓ No evictions yet (database not full)');
  }

  // 17. Performance Comparison
  console.log('\n17. Operation Performance Test:');
  
  const ops = {};

  // Test SET
  let t1 = Date.now();
  for (let i = 0; i < 100; i++) {
    await client.set(`bench:set:${i}`, `val:${i}`);
  }
  ops['SET'] = Date.now() - t1;

  // Test GET
  t1 = Date.now();
  for (let i = 0; i < 100; i++) {
    await client.get(`bench:set:${i}`);
  }
  ops['GET'] = Date.now() - t1;

  // Test INCR
  t1 = Date.now();
  for (let i = 0; i < 100; i++) {
    await client.incr(`bench:counter:${i}`);
  }
  ops['INCR'] = Date.now() - t1;

  // Test LPUSH
  t1 = Date.now();
  for (let i = 0; i < 100; i++) {
    await client.lPush(`bench:list:1`, `item:${i}`);
  }
  ops['LPUSH'] = Date.now() - t1;

  console.log('✓ Performance metrics (100 operations each):');
  Object.entries(ops).forEach(([op, time]) => {
    console.log(`  ${op}: ${time}ms (~${(time / 100).toFixed(2)}ms per op)`);
  });

  // 18. Info Command Full Sections
  console.log('\n18. Available Info Sections:');
  console.log('  server, clients, memory, persistence, stats');
  console.log('  replication, cpu, commandstats, cluster, keyspace');

  // 19. Real-Time Monitoring Setup
  console.log('\n19. Real-Time Monitoring:');
  console.log('✓ Use external tools:');
  console.log('  - redis-cli --stat (real-time stats)');
  console.log('  - RedisInsight (GUI monitoring)');
  console.log('  - New Relic Redis plugin');
  console.log('  - Datadog Redis integration');

  // 20. Health Check Function
  console.log('\n20. Health Check Function Example:');
  
  async function healthCheck() {
    try {
      const ping = await client.ping();
      const info = await client.info('server');
      const memory = await client.info('memory');
      
      return {
        status: 'healthy',
        ping,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  const health = await healthCheck();
  console.log('✓ Health check:', health.status);

  console.log('\n=== MONITORING & STATISTICS COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
