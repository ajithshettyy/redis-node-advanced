import { createClient } from 'redis';

// Main entry point to demonstrate connection and basic operations
const client = createClient({
  host: 'localhost',
  port: 6379,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

// Error handler
client.on('error', (err) => console.error('Redis Client Error', err));

try {
  // Connect to Redis
  await client.connect();
  console.log('✓ Connected to Redis');

  // Basic test
  await client.set('hello', 'world');
  const value = await client.get('hello');
  console.log(`✓ Hello Key Value: ${value}`);

  // Test connection info
  const info = await client.info('server');
  console.log('✓ Redis Server Connected Successfully!');
  console.log('\nRun examples using npm scripts:');
  console.log('  npm run basics       - Basic Redis operations');
  console.log('  npm run caching      - Caching patterns');
  console.log('  npm run sessions     - Session management');
  console.log('  npm run pubsub       - Pub/Sub messaging');
  console.log('  npm run streams      - Redis Streams');
  console.log('  npm run sorted-sets  - Sorted Sets operations');
  console.log('  npm run transactions - Transactions & Pipelining');
  console.log('  npm run hashes       - Hash data structure');
  console.log('  npm run lists        - List operations');
  console.log('  npm run sets         - Set operations');
  console.log('  npm run hyperloglog  - HyperLogLog');
  console.log('  npm run geospatial   - Geospatial operations');
  console.log('  npm run cluster      - Cluster introduction');
  console.log('  npm run monitor      - Monitoring & Stats');

  await client.quit();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
