import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Sorted Sets - Advanced use cases
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== SORTED SETS ===\n');

  // 1. Basic Sorted Set Operations
  console.log('1. Basic Sorted Set Operations:');
  
  const leaderboard = 'game:leaderboard';
  await client.zAdd(leaderboard, [
    { score: 1000, member: 'player1' },
    { score: 1200, member: 'player2' },
    { score: 950, member: 'player3' },
    { score: 1500, member: 'player4' }
  ]);
  console.log('✓ Added players to leaderboard');

  // Get top players
  const top3 = await client.zRevRange(leaderboard, 0, 2, { WITHSCORES: true });
  console.log('✓ Top 3 players:');
  for (let i = 0; i < top3.length; i += 2) {
    console.log(`  ${(i / 2) + 1}. ${top3[i]} - ${top3[i + 1]} points`);
  }

  // 2. Rank and Score Operations
  console.log('\n2. Rank and Score:');
  
  const player2Score = await client.zScore(leaderboard, 'player2');
  console.log(`✓ Player2 score: ${player2Score}`);

  const player2Rank = await client.zRevRank(leaderboard, 'player2');
  console.log(`✓ Player2 rank (rev): ${player2Rank + 1}`);

  // 3. Score Updates
  console.log('\n3. Update Scores:');
  
  // Increment player1's score
  const newScore = await client.zIncrBy(leaderboard, 300, 'player1');
  console.log(`✓ Player1 new score: ${newScore}`);

  // Get updated ranking
  const updatedRank = await client.zRevRank(leaderboard, 'player1');
  console.log(`✓ Player1 new rank: ${updatedRank + 1}`);

  // 4. Range Queries
  console.log('\n4. Range Queries:');
  
  // Get players with scores between 1000 and 1300
  const midRange = await client.zRangeByScore(leaderboard, 1000, 1300, { WITHSCORES: true });
  console.log(`✓ Players with 1000-1300 points:`);
  for (let i = 0; i < midRange.length; i += 2) {
    console.log(`  ${midRange[i]}: ${midRange[i + 1]} points`);
  }

  // 5. Leaderboard with Time Decay (using current timestamp as score)
  console.log('\n5. Time-Based Ranking (Recent Activity):');
  
  const recentActivity = 'activity:recent';
  const now = Date.now();
  
  await client.zAdd(recentActivity, [
    { score: now - 60000, member: 'user1' },        // 1 minute ago
    { score: now - 30000, member: 'user2' },        // 30 seconds ago
    { score: now - 5000, member: 'user3' }          // 5 seconds ago
  ]);

  const mostRecent = await client.zRevRange(recentActivity, 0, -1, { WITHSCORES: true });
  console.log('✓ Most recent activity:');
  mostRecent.forEach((item, i) => {
    if (i % 2 === 0) {
      const timestamp = parseInt(mostRecent[i + 1]);
      const seconds = Math.floor((now - timestamp) / 1000);
      console.log(`  ${item}: ${seconds}s ago`);
    }
  });

  // 6. Sorted Set with Tags (using score for priority)
  console.log('\n6. Priority Queue (using Sorted Set):');
  
  const taskQueue = 'tasks:priority';
  await client.zAdd(taskQueue, [
    { score: 1, member: 'send-email-low' },
    { score: 2, member: 'process-image' },
    { score: 3, member: 'send-sms-high' },
    { score: 2, member: 'backup-db' }
  ]);

  const highPriorityTasks = await client.zRevRange(taskQueue, 0, -1, { WITHSCORES: true });
  console.log('✓ Tasks by priority (highest first):');
  for (let i = 0; i < highPriorityTasks.length; i += 2) {
    console.log(`  Priority ${highPriorityTasks[i + 1]}: ${highPriorityTasks[i]}`);
  }

  // 7. Percentile Rankings
  console.log('\n7. Percentile Query:');
  
  const totalMembers = await client.zCard(leaderboard);
  console.log(`✓ Total players: ${totalMembers}`);

  // Get 75th percentile
  const index75 = Math.floor(totalMembers * 0.25); // 25th highest
  const percentile75 = await client.zRevRange(leaderboard, index75, index75, { WITHSCORES: true });
  console.log(`✓ 75th percentile score: ${percentile75[1]}`);

  // 8. Sorted Set Operations (UNION, INTER)
  console.log('\n8. Set Operations:');
  
  const set1 = 'winners:2024';
  const set2 = 'winners:2023';
  const set3 = 'winners:combined';

  await client.zAdd(set1, [
    { score: 1, member: 'alice' },
    { score: 2, member: 'bob' }
  ]);

  await client.zAdd(set2, [
    { score: 1, member: 'charlie' },
    { score: 2, member: 'alice' }
  ]);

  // Union (2024 and 2023 winners)
  await client.zUnionStore(set3, [set1, set2], { AGGREGATE: 'SUM' });
  const unionResult = await client.zRevRange(set3, 0, -1, { WITHSCORES: true });
  console.log('✓ Union of winners (summed scores):');
  for (let i = 0; i < unionResult.length; i += 2) {
    console.log(`  ${unionResult[i]}: ${unionResult[i + 1]} wins`);
  }

  // 9. Remove by Rank
  console.log('\n9. Removal Operations:');
  
  const beforeRemove = await client.zCard(leaderboard);
  console.log(`  Players before: ${beforeRemove}`);

  // Remove bottom 2 players
  await client.zRemRangeByRank(leaderboard, 0, 1);
  const afterRemove = await client.zCard(leaderboard);
  console.log(`✓ Removed bottom 2 players`);
  console.log(`  Players after: ${afterRemove}`);

  // 10. Count in Range
  console.log('\n10. Count Operations:');
  
  const refreshedLeaderboard = 'game:lb:new';
  await client.zAdd(refreshedLeaderboard, [
    { score: 100, member: 'p1' },
    { score: 200, member: 'p2' },
    { score: 300, member: 'p3' },
    { score: 400, member: 'p4' },
    { score: 500, member: 'p5' }
  ]);

  const countInRange = await client.zCountByScore(refreshedLeaderboard, 200, 400);
  console.log(`✓ Players with scores 200-400: ${countInRange}`);

  // 11. Lex Range (string-based range)
  console.log('\n11. Lexicographical Range:');
  
  const vocabulary = 'words';
  await client.zAdd(vocabulary, [
    { score: 0, member: 'apple' },
    { score: 0, member: 'banana' },
    { score: 0, member: 'cherry' },
    { score: 0, member: 'date' }
  ]);

  const lexRange = await client.zRangeByLex(vocabulary, '[b', '[c');
  console.log(`✓ Words between 'b' and 'c': ${lexRange.join(', ')}`);

  console.log('\n=== SORTED SETS COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
