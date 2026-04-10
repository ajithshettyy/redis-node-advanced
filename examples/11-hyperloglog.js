import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// HyperLogLog - Probabilistic data structure for counting unique items
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== HYPERLOGLOG ===\n');

  // 1. Basic HyperLogLog Operations
  console.log('1. Basic HyperLogLog Operations:');
  
  const visitorsKey = 'page:visitors';
  
  // Add visitors (very memory efficient)
  await client.pfAdd(visitorsKey, 'user1', 'user2', 'user3', 'user1', 'user4');
  console.log('✓ Added 5 visitors (4 unique)');

  // Get approximate count
  const count = await client.pfCount(visitorsKey);
  console.log(`✓ Approximate unique visitors: ${count}`);

  // 2. HyperLogLog Advantages
  console.log('\n2. Memory Efficiency Demo:');
  console.log(`  HyperLogLog uses ~12KB regardless of number of unique items`);
  console.log(`  vs Set which uses ~200 bytes per item`);
  console.log(`  For 1 million unique items:`);
  console.log(`    Set: ~200 MB`);
  console.log(`    HyperLogLog: ~12 KB`);

  // 3. Multiple HyperLogLogs
  console.log('\n3. Multiple HyperLogLogs:');
  
  const dayVisitors = 'visitors:day1';
  const day2Visitors = 'visitors:day2';

  await client.pfAdd(dayVisitors, 'user1', 'user2', 'user3', 'user4', 'user5');
  await client.pfAdd(day2Visitors, 'user3', 'user4', 'user5', 'user6', 'user7');

  const day1Count = await client.pfCount(dayVisitors);
  const day2Count = await client.pfCount(day2Visitors);

  console.log(`✓ Day 1 visitors: ${day1Count}`);
  console.log(`✓ Day 2 visitors: ${day2Count}`);

  // 4. HyperLogLog Merge
  console.log('\n4. Merge HyperLogLogs:');
  
  const mergedKey = 'visitors:total';
  
  // Merge day1 and day2 visitors
  const mergedCount = await client.pfCount(dayVisitors, day2Visitors);
  console.log(`✓ Total unique visitors (Day 1 + Day 2): ${mergedCount}`);

  // Store merged result
  await client.pfMerge(mergedKey, dayVisitors, day2Visitors);
  const storedCount = await client.pfCount(mergedKey);
  console.log(`✓ Merged and stored: ${storedCount} unique visitors`);

  // 5. Weekly Unique Visitors
  console.log('\n5. Weekly Unique Visitors:');
  
  const weekDays = [];
  for (let i = 1; i <= 7; i++) {
    const dayKey = `visitors:day${i}`;
    
    // Simulate visitors for each day
    const dayVisitors = [];
    for (let j = 0; j < 20; j++) {
      const userId = Math.floor(Math.random() * 50) + 1; // 50 possible users
      dayVisitors.push(`user${userId}`);
    }
    
    await client.pfAdd(dayKey, ...dayVisitors);
    weekDays.push(dayKey);
  }

  // Get unique visitors for the week
  const weekTotal = await client.pfCount(...weekDays);
  console.log(`✓ Week total unique visitors: ${weekTotal}`);

  // 6. Real-Time Analytics
  console.log('\n6. Real-Time Analytics:');
  
  const analyticsKey = 'analytics:session';
  
  // Simulate session tracking
  for (let i = 0; i < 100; i++) {
    const userId = Math.floor(Math.random() * 200) + 1;
    await client.pfAdd(analyticsKey, `session:${userId}`);
  }

  const uniqueSessions = await client.pfCount(analyticsKey);
  console.log(`✓ Unique sessions tracked: ${uniqueSessions}`);

  // 7. Compare Different Tracking Methods
  console.log('\n7. Comparison: Set vs HyperLogLog');
  console.log('  Tracking 1000 page views from ~300 unique users');
  
  const setKey = 'users:set';
  const hllKey = 'users:hll';

  // Simulate data
  for (let i = 0; i < 1000; i++) {
    const userId = Math.floor(Math.random() * 300) + 1;
    await client.sAdd(setKey, `user${userId}`);
    await client.pfAdd(hllKey, `user${userId}`);
  }

  const setCount = await client.sCard(setKey);
  const hllCount = await client.pfCount(hllKey);

  console.log(`✓ Set count: ${setCount} (exact)`);
  console.log(`✓ HyperLogLog count: ${hllCount} (approximate, ~12KB memory)`);

  // 8. Geographic Tracking
  console.log('\n8. Geographic Tracking with HyperLogLog:');
  
  const usaVisitors = 'geo:usa:visitors';
  const europeVisitors = 'geo:europe:visitors';

  // Simulate visitors from different regions
  for (let i = 0; i < 50; i++) {
    await client.pfAdd(usaVisitors, `visitor:${i}`);
  }

  for (let i = 25; i < 75; i++) {
    await client.pfAdd(europeVisitors, `visitor:${i}`);
  }

  const usaCount = await client.pfCount(usaVisitors);
  const euroCount = await client.pfCount(europeVisitors);
  const totalGeo = await client.pfCount(usaVisitors, europeVisitors);

  console.log(`✓ USA visitors: ${usaCount}`);
  console.log(`✓ Europe visitors: ${euroCount}`);
  console.log(`✓ Total unique visitors: ${totalGeo}`);

  // 9. API Usage Tracking
  console.log('\n9. API Usage Tracking:');
  
  const apiEndpoints = ['api:users', 'api:posts', 'api:comments'];
  
  // Simulate API calls from different clients
  for (const endpoint of apiEndpoints) {
    for (let i = 0; i < 30; i++) {
      const clientId = Math.floor(Math.random() * 20) + 1;
      await client.pfAdd(endpoint, `client:${clientId}`);
    }
  }

  console.log('✓ API Endpoint Usage:');
  for (const endpoint of apiEndpoints) {
    const count = await client.pfCount(endpoint);
    console.log(`  ${endpoint}: ${count} unique clients`);
  }

  // All unique clients
  const allClients = await client.pfCount(...apiEndpoints);
  console.log(`✓ Total unique clients across all endpoints: ${allClients}`);

  // 10. HyperLogLog Error Rate
  console.log('\n10. Accuracy Note:');
  console.log(`  HyperLogLog has ~2% error rate (configurable in Redis config)`);
  console.log(`  Trade-off: Fixed memory (~12KB) vs Exact counts (linear memory)`);
  console.log(`  Use cases: Unique visitors, unique IPs, unique search queries`);
  console.log(`  NOT suitable for: Items that need to be exact`);

  // 11. Time-Series with HyperLogLog
  console.log('\n11. Time-Series Unique Tracking:');
  
  const hourlyPrefix = 'visits:hourly';
  
  for (let hour = 0; hour < 24; hour++) {
    const hourKey = `${hourlyPrefix}:${hour}`;
    
    // Simulate visitors for each hour
    for (let i = 0; i < 50; i++) {
      const userId = Math.floor(Math.random() * 100) + 1;
      await client.pfAdd(hourKey, `user${userId}`);
    }
  }

  // Get all hourly keys
  const hourlyKeys = [];
  for (let hour = 0; hour < 24; hour++) {
    hourlyKeys.push(`${hourlyPrefix}:${hour}`);
  }

  const dailyTotal = await client.pfCount(...hourlyKeys);
  console.log(`✓ Daily unique visitors: ${dailyTotal}`);

  // 12. Practical Example: Social Network Follow Count
  console.log('\n12. Social Network - Who Viewed My Profile:');
  
  const profileViewsKey = 'profile:user123:views';
  
  // Simulate profile views
  for (let i = 0; i < 500; i++) {
    const viewerId = Math.floor(Math.random() * 1000) + 1;
    await client.pfAdd(profileViewsKey, `user${viewerId}`);
  }

  const profileViewCount = await client.pfCount(profileViewsKey);
  console.log(`✓ Profile views from unique users: ${profileViewCount}`);
  console.log(`  Memory usage: ~12KB (vs ~24KB with Set)`);

  console.log('\n=== HYPERLOGLOG COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
