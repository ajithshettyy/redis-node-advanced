import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Transactions, Pipelining, and Scripting
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== TRANSACTIONS & PIPELINING ===\n');

  // 1. Basic Transaction (MULTI/EXEC)
  console.log('1. Basic Transaction (MULTI/EXEC):');
  
  const tx = client.multi();
  tx.set('account:1:balance', '1000');
  tx.set('account:2:balance', '500');
  tx.get('account:1:balance');
  tx.get('account:2:balance');
  
  const results = await tx.exec();
  console.log(`✓ Transaction executed`);
  console.log(`  Returned values: ${JSON.stringify(results)}`);

  // 2. Money Transfer (Atomic Operation)
  console.log('\n2. Atomic Money Transfer:');
  
  async function transferMoney(from, to, amount) {
    const tx = client.multi();
    
    // Debit from account
    tx.decrBy(`account:${from}:balance`, amount);
    
    // Credit to account
    tx.incrBy(`account:${to}:balance`, amount);
    
    // Record transaction
    tx.lPush(`account:${from}:history`, `transferred ${amount} to ${to}`);
    tx.lPush(`account:${to}:history`, `received ${amount} from ${from}`);
    
    const txResult = await tx.exec();
    return txResult;
  }

  await transferMoney(1, 2, 100);
  const balance1 = await client.get('account:1:balance');
  const balance2 = await client.get('account:2:balance');
  console.log(`✓ Transfer complete`);
  console.log(`  Account 1: $${balance1}`);
  console.log(`  Account 2: $${balance2}`);

  // 3. Transaction with Watch (Optimistic Locking)
  console.log('\n3. Optimistic Locking (WATCH):');
  
  await client.set('product:1:stock', '10');

  async function reserveStock(productId, quantity) {
    const key = `product:${productId}:stock`;
    
    // Watch the key for changes
    await client.watch(key);
    
    const currentStock = await client.get(key);
    console.log(`  Current stock: ${currentStock}`);
    
    if (parseInt(currentStock) >= quantity) {
      const tx = client.multi();
      tx.decrBy(key, quantity);
      
      try {
        const result = await tx.exec();
        if (result) {
          console.log(`✓ Reserved ${quantity} units`);
          return true;
        }
      } catch (error) {
        console.log(`✗ Reservation failed - stock changed`);
        return false;
      }
    } else {
      await client.unwatch();
      console.log(`✗ Insufficient stock`);
      return false;
    }
  }

  await reserveStock(1, 3);

  // 4. Pipelining - Send multiple commands without waiting
  console.log('\n4. Pipelining:');
  
  const pipeline = client.multi();
  
  // Add multiple commands
  for (let i = 0; i < 5; i++) {
    pipeline.set(`key:${i}`, `value:${i}`);
  }
  
  for (let i = 0; i < 5; i++) {
    pipeline.get(`key:${i}`);
  }

  const start = Date.now();
  const pipelineResults = await pipeline.exec();
  const duration = Date.now() - start;

  console.log(`✓ Pipelined 10 commands in ${duration}ms`);
  console.log(`  Returned ${pipelineResults.length} results`);

  // 5. Conditional Update
  console.log('\n5. Conditional Update (Check-Then-Set):');
  
  async function updateIfExists(key, newValue) {
    await client.watch(key);
    const exists = await client.exists(key);
    
    if (exists) {
      const tx = client.multi();
      tx.set(key, newValue);
      const result = await tx.exec();
      console.log(`✓ Updated existing key: ${key}`);
      return true;
    } else {
      await client.unwatch();
      console.log(`✗ Key does not exist: ${key}`);
      return false;
    }
  }

  await client.set('existing:key', 'old-value');
  await updateIfExists('existing:key', 'new-value');
  await updateIfExists('nonexistent:key', 'value');

  // 6. Batch Counter Increments
  console.log('\n6. Batch Counter Operations:');
  
  const counterPipeline = client.multi();
  const counters = ['page:views', 'user:signups', 'api:calls', 'errors:count'];
  
  for (let i = 0; i < 100; i++) {
    counterPipeline.incr(counters[i % counters.length]);
  }

  const counterResults = await counterPipeline.exec();
  console.log(`✓ Incremented counters 100 times total`);

  const pageViews = await client.get('page:views');
  console.log(`  Page views: ${pageViews}`);

  // 7. DISCARD - Cancel transaction
  console.log('\n7. Transaction DISCARD:');
  
  const discardTx = client.multi();
  discardTx.set('should:not:exist', 'value');
  discardTx.incr('should:not:exist');
  
  await discardTx.discard();
  const shouldNotExist = await client.get('should:not:exist');
  console.log(`✓ Transaction discarded`);
  console.log(`  Key exists: ${shouldNotExist !== null}`);

  // 8. Retry Logic for Transaction
  console.log('\n8. Retry on Transaction Conflict:');
  
  async function updateWithRetry(key, operation, maxRetries = 3) {
    for (let retry = 0; retry < maxRetries; retry++) {
      await client.watch(key);
      const value = parseInt(await client.get(key) || '0');
      
      const tx = client.multi();
      tx.set(key, operation(value));
      
      try {
        const result = await tx.exec();
        if (result) {
          console.log(`✓ Update succeeded on attempt ${retry + 1}`);
          return true;
        }
      } catch (e) {
        console.log(`  Attempt ${retry + 1} failed, retrying...`);
      }
    }
    
    console.log(`✗ Failed after ${maxRetries} attempts`);
    return false;
  }

  await client.set('counter', '0');
  await updateWithRetry('counter', (value) => value + 10);

  // 9. Lua Script Execution (more complex atomic operations)
  console.log('\n9. Lua Script for Atomic Operations:');
  
  const script = `
    local current = redis.call('GET', KEYS[1])
    if not current then
      return nil
    end
    if tonumber(current) >= tonumber(ARGV[1]) then
      redis.call('SET', KEYS[1], tonumber(current) - tonumber(ARGV[1]))
      return tonumber(current) - tonumber(ARGV[1])
    end
    return false
  `;

  await client.set('balance', '100');
  const scriptResult = await client.eval(script, {
    keys: ['balance'],
    arguments: ['30']
  });

  console.log(`✓ Lua script executed`);
  console.log(`  Remaining balance: ${scriptResult}`);

  console.log('\n=== TRANSACTIONS & PIPELINING COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
