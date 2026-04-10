import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Advanced Basics - String operations, expiration, and atomic operations
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== ADVANCED BASICS ===\n');

  // 1. SET with options
  console.log('1. SET with Options:');
  await client.set('user:1:name', 'John', {
    EX: 60, // expire in 60 seconds
    NX: true // only set if not exists
  });
  console.log('✓ Set key with expiration (EX: 60s) and NX flag');

  // 2. GET and check TTL
  const name = await client.get('user:1:name');
  const ttl = await client.ttl('user:1:name');
  console.log(`✓ Value: ${name}, TTL: ${ttl}s`);

  // 3. INCR and DECR (atomic operations)
  console.log('\n2. Atomic Counters:');
  await client.set('page:views', '0');
  await client.incr('page:views');
  await client.incr('page:views');
  await client.incrBy('page:views', 5);
  const views = await client.get('page:views');
  console.log(`✓ Page views: ${views}`);

  // 4. APPEND
  console.log('\n3. String Append:');
  await client.set('greeting', 'Hello');
  await client.append('greeting', ' World');
  const greeting = await client.get('greeting');
  console.log(`✓ Greeting: ${greeting}`);

  // 5. GETRANGE and SETRANGE
  console.log('\n4. Substring Operations:');
  await client.set('message', 'Hello World');
  const substring = await client.getRange('message', 0, 4);
  console.log(`✓ Substring (0-4): ${substring}`);
  
  await client.setRange('message', 6, 'Redis');
  const modified = await client.get('message');
  console.log(`✓ After SETRANGE: ${modified}`);

  // 6. MGET and MSET
  console.log('\n5. Multiple Key Operations:');
  await client.mSet({
    'key1': 'value1',
    'key2': 'value2',
    'key3': 'value3'
  });
  const mgetResult = await client.mGet(['key1', 'key2', 'key3']);
  console.log(`✓ MGET result: ${JSON.stringify(mgetResult)}`);

  // 7. GETEX (GET with options)
  console.log('\n6. GETEX - Get with EX option:');
  await client.set('temp:data', 'important');
  const data = await client.getEx('temp:data', { EX: 30 });
  console.log(`✓ Got data: ${data} (expires in 30s)`);

  // 8. STRLEN
  console.log('\n7. String Length:');
  const length = await client.strLen('greeting');
  console.log(`✓ Length of 'greeting': ${length}`);

  // 9. SETEX and PSETEX (Set with expiration)
  console.log('\n8. Set with Expiration:');
  await client.setEx('session:123', 3600, 'session_data');
  const sessionTtl = await client.ttl('session:123');
  console.log(`✓ Session key set with TTL: ${sessionTtl}s`);

  // 10. EXISTS and DEL
  console.log('\n9. Key Management:');
  const exists = await client.exists('greeting');
  console.log(`✓ 'greeting' exists: ${exists === 1}`);
  
  const deleted = await client.del(['greeting', 'message']);
  console.log(`✓ Deleted ${deleted} keys`);

  console.log('\n=== BASICS EXAMPLES COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
