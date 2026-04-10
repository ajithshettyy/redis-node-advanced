import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Set Data Structure Operations
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== SET DATA STRUCTURE ===\n');

  // 1. Basic Set Operations
  console.log('1. Basic Set Operations:');
  
  const tagsKey = 'article:1:tags';
  
  // Add members to set
  await client.sAdd(tagsKey, 'javascript', 'redis', 'nodejs', 'database');
  console.log('✓ Added tags to set');

  // Get set size
  const size = await client.sCard(tagsKey);
  console.log(`  Set size: ${size}`);

  // Get all members
  const members = await client.sMembers(tagsKey);
  console.log(`✓ Tags: ${members.join(', ')}`);

  // 2. Set Membership
  console.log('\n2. Membership Check:');
  
  const isRedisTag = await client.sIsMember(tagsKey, 'redis');
  const isPythonTag = await client.sIsMember(tagsKey, 'python');
  
  console.log(`  'redis' is a tag: ${isRedisTag === 1}`);
  console.log(`  'python' is a tag: ${isPythonTag === 1}`);

  // 3. Remove Members
  console.log('\n3. Remove Members:');
  
  const removed = await client.sRem(tagsKey, 'database');
  console.log(`✓ Removed ${removed} member(s)`);

  const updatedMembers = await client.sMembers(tagsKey);
  console.log(`  Remaining: ${updatedMembers.join(', ')}`);

  // 4. Pop Operation
  console.log('\n4. Pop Operation:');
  
  const popped = await client.sPop(tagsKey);
  console.log(`✓ Popped: ${popped}`);

  // 5. Set Intersection (Common Tags)
  console.log('\n5. Set Intersection - Common Elements:');
  
  const article1Tags = 'article:1:tags:reset';
  const article2Tags = 'article:2:tags';

  await client.sAdd(article1Tags, 'javascript', 'redis', 'web', 'backend');
  await client.sAdd(article2Tags, 'javascript', 'nodejs', 'backend', 'database');

  const commonTags = await client.sInter(article1Tags, article2Tags);
  console.log(`✓ Common tags: ${commonTags.join(', ')}`);

  // 6. Set Union (All Tags)
  console.log('\n6. Set Union - All Elements:');
  
  const allTags = await client.sUnion(article1Tags, article2Tags);
  console.log(`✓ All tags: ${allTags.join(', ')}`);

  // 7. Set Difference
  console.log('\n7. Set Difference:');
  
  // Tags in article1 but not in article2
  const uniqueToArticle1 = await client.sDiff(article1Tags, article2Tags);
  console.log(`✓ Tags unique to article 1: ${uniqueToArticle1.join(', ')}`);

  // 8. Store Set Operations Results
  console.log('\n8. Store Set Operations:');
  
  const commonTagsKey = 'common:tags';
  const commonCount = await client.sInterStore(commonTagsKey, article1Tags, article2Tags);
  console.log(`✓ Stored ${commonCount} common tags`);

  const storedCommon = await client.sMembers(commonTagsKey);
  console.log(`  Stored set: ${storedCommon.join(', ')}`);

  // 9. User Followers - Set Use Case
  console.log('\n9. User Followers Set:');
  
  const user1Followers = 'user:1:followers';
  const user2Followers = 'user:2:followers';

  await client.sAdd(user1Followers, 'alice', 'bob', 'charlie', 'david');
  await client.sAdd(user2Followers, 'bob', 'charlie', 'eve', 'frank');

  console.log(`✓ User 1 followers: ${(await client.sMembers(user1Followers)).join(', ')}`);
  console.log(`✓ User 2 followers: ${(await client.sMembers(user2Followers)).join(', ')}`);

  // Find mutual followers
  const mutualFollowers = await client.sInter(user1Followers, user2Followers);
  console.log(`✓ Mutual followers: ${mutualFollowers.join(', ')}`);

  // 10. Unique Visitors (Counting Unique IP Addresses)
  console.log('\n10. Unique Visitors Tracking:');
  
  const visitorsKey = 'daily:visitors:2024-04-10';
  
  // Simulate daily visitors
  const visitors = ['192.168.1.1', '192.168.1.2', '192.168.1.1', '192.168.1.3', '192.168.1.2'];
  
  for (const ip of visitors) {
    await client.sAdd(visitorsKey, ip);
  }

  const uniqueVisitors = await client.sCard(visitorsKey);
  console.log(`✓ Total visitors seen: ${visitors.length}`);
  console.log(`✓ Unique visitors: ${uniqueVisitors}`);

  // 11. Prevent Duplicate Entries
  console.log('\n11. Duplicate Prevention:');
  
  const emailsKey = 'newsletter:emails';
  
  async function subscribeEmail(email) {
    const result = await client.sAdd(emailsKey, email);
    if (result === 1) {
      console.log(`✓ ${email} subscribed`);
      return true;
    } else {
      console.log(`✗ ${email} already subscribed`);
      return false;
    }
  }

  await subscribeEmail('user1@example.com');
  await subscribeEmail('user2@example.com');
  await subscribeEmail('user1@example.com'); // Duplicate

  // 12. Random Member Selection
  console.log('\n12. Random Selection:');
  
  const choicesSet = 'choices';
  await client.sAdd(choicesSet, 'option-a', 'option-b', 'option-c', 'option-d');

  // Get random member
  const randomChoice = await client.sRandMember(choicesSet);
  console.log(`✓ Random choice: ${randomChoice}`);

  // Get multiple random members
  const twoRandom = await client.sRandMember(choicesSet, 2);
  console.log(`✓ Two random choices: ${twoRandom.join(', ')}`);

  // 13. Lottery/Raffle with Sets
  console.log('\n13. Lottery System:');
  
  const raffleKey = 'raffle:2024';
  const participants = ['john', 'jane', 'bob', 'alice', 'charlie'];
  
  for (const participant of participants) {
    await client.sAdd(raffleKey, participant);
  }

  console.log(`✓ Raffle participants: ${(await client.sMembers(raffleKey)).join(', ')}`);

  // Draw winners
  const winners = [];
  for (let i = 0; i < 2; i++) {
    const winner = await client.sPop(raffleKey);
    if (winner) {
      winners.push(winner);
    }
  }

  console.log(`✓ Winners: ${winners.join(', ')}`);

  // 14. Tags/Categories Intersection
  console.log('\n14. Product Search with Multiple Tags:');
  
  const tag1 = 'products:tag:electronics';
  const tag2 = 'products:tag:affordable';
  const tag3 = 'products:tag:bestseller';

  await client.sAdd(tag1, 'laptop', 'phone', 'tablet', 'headphones');
  await client.sAdd(tag2, 'phone', 'headphones', 'charger');
  await client.sAdd(tag3, 'phone', 'laptop');

  // Find products that are electronics AND affordable AND bestseller
  const filtered = await client.sInter(tag1, tag2, tag3);
  console.log(`✓ Products (electronics + affordable + bestseller): ${filtered.join(', ')}`);

  // 15. Move Operation Between Sets
  console.log('\n15. Move Between Sets:');
  
  const activeSet = 'users:active';
  const inactiveSet = 'users:inactive';

  await client.sAdd(activeSet, 'user1', 'user2', 'user3');
  
  console.log(`  Active: ${(await client.sMembers(activeSet)).join(', ')}`);

  // Move user from active to inactive
  const moved = await client.sMove(activeSet, inactiveSet, 'user1');
  console.log(`✓ Moved user1 to inactive: ${moved === 1}`);

  console.log(`  Active: ${(await client.sMembers(activeSet)).join(', ')}`);
  console.log(`  Inactive: ${(await client.sMembers(inactiveSet)).join(', ')}`);

  console.log('\n=== SET DATA STRUCTURE COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
