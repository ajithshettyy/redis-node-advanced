import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// List Data Structure Operations
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== LIST DATA STRUCTURE ===\n');

  // 1. Basic List Push and Pop
  console.log('1. Basic Push/Pop Operations:');
  
  const queueKey = 'task:queue';
  
  // Push items to list
  await client.rPush(queueKey, 'task1', 'task2', 'task3');
  console.log('✓ Pushed 3 tasks to queue');

  // Get list length
  const length = await client.lLen(queueKey);
  console.log(`  Queue length: ${length}`);

  // Pop from right
  const popped = await client.rPop(queueKey);
  console.log(`✓ Popped from right: ${popped}`);

  // 2. Stack Operations (LIFO)
  console.log('\n2. Stack Operations (LIFO):');
  
  const stackKey = 'browser:history';
  
  await client.lPush(stackKey, 'page1');
  await client.lPush(stackKey, 'page2');
  await client.lPush(stackKey, 'page3');
  console.log('✓ Navigated to pages 3, 2, 1');

  const currentPage = await client.lIndex(stackKey, 0);
  console.log(`  Current page: ${currentPage}`);

  const previousPage = await client.lPop(stackKey);
  console.log(`✓ Back button - previous page: ${previousPage}`);

  // 3. Queue Operations (FIFO)
  console.log('\n3. Queue Operations (FIFO):');
  
  const jobQueue = 'jobs:processing';
  
  // Enqueue jobs
  await client.rPush(jobQueue, 'job:001', 'job:002', 'job:003');
  console.log('✓ Enqueued 3 jobs');

  // Dequeue jobs (process FIFO)
  const firstJob = await client.lPop(jobQueue);
  console.log(`✓ Dequeued (FIFO): ${firstJob}`);

  // 4. Range Operations
  console.log('\n4. Get Range:');
  
  const taskQueueKey = 'tasks:list';
  await client.rPush(taskQueueKey, 'A', 'B', 'C', 'D', 'E', 'F', 'G');
  
  // Get first 3 items
  const firstThree = await client.lRange(taskQueueKey, 0, 2);
  console.log(`✓ First 3 items: ${firstThree.join(', ')}`);

  // Get all items
  const allItems = await client.lRange(taskQueueKey, 0, -1);
  console.log(`✓ All items: ${allItems.join(', ')}`);

  // Get last 2 items
  const lastTwo = await client.lRange(taskQueueKey, -2, -1);
  console.log(`✓ Last 2 items: ${lastTwo.join(', ')}`);

  // 5. Trim List
  console.log('\n5. Trim List:');
  
  const beforeTrim = await client.lLen(taskQueueKey);
  console.log(`  Items before trim: ${beforeTrim}`);

  // Keep only items 1-4 (0-indexed)
  await client.lTrim(taskQueueKey, 1, 4);
  const afterTrim = await client.lLen(taskQueueKey);
  console.log(`✓ Trimmed to items 1-4`);
  console.log(`  Items after trim: ${afterTrim}`);

  // 6. Set by Index
  console.log('\n6. Set and Get by Index:');
  
  const listKey = 'priorities';
  await client.rPush(listKey, 'low', 'medium', 'high');
  
  const valueAt1 = await client.lIndex(listKey, 1);
  console.log(`  Value at index 1: ${valueAt1}`);

  // Update value at index
  await client.lSet(listKey, 1, 'urgent');
  const updatedValue = await client.lIndex(listKey, 1);
  console.log(`✓ Updated index 1 to: ${updatedValue}`);

  // 7. Insert Operations
  console.log('\n7. Insert Operations:');
  
  const insertKey = 'items';
  await client.rPush(insertKey, 'apple', 'cherry');

  // Insert before 'cherry'
  await client.lInsertBefore(insertKey, 'cherry', 'banana');
  console.log(`✓ Inserted 'banana' before 'cherry'`);

  const items = await client.lRange(insertKey, 0, -1);
  console.log(`  List: ${items.join(', ')}`);

  // Insert after 'cherry'
  await client.lInsertAfter(insertKey, 'cherry', 'date');
  console.log(`✓ Inserted 'date' after 'cherry'`);

  const updatedItems = await client.lRange(insertKey, 0, -1);
  console.log(`  List: ${updatedItems.join(', ')}`);

  // 8. Remove Operations
  console.log('\n8. Remove Operations:');
  
  const removeKey = 'tasks:remove';
  await client.rPush(removeKey, 'a', 'b', 'a', 'c', 'a');
  
  console.log(`  Initial: ${(await client.lRange(removeKey, 0, -1)).join(', ')}`);

  // Remove 2 occurrences of 'a'
  const removed = await client.lRem(removeKey, 2, 'a');
  console.log(`✓ Removed ${removed} occurrences of 'a'`);
  
  const remaining = await client.lRange(removeKey, 0, -1);
  console.log(`  After removal: ${remaining.join(', ')}`);

  // Pop from left
  const popped2 = await client.lPop(removeKey);
  console.log(`✓ Popped from left: ${popped2}`);

  // 9. Message Queue/Pub-Sub with Lists
  console.log('\n9. Message Queue Pattern:');
  
  const messageQueue = 'messages:queue';
  
  async function enqueueMessage(message) {
    await client.rPush(messageQueue, JSON.stringify(message));
  }

  async function dequeueMessage() {
    const msg = await client.lPop(messageQueue);
    return msg ? JSON.parse(msg) : null;
  }

  await enqueueMessage({ id: 1, text: 'Hello' });
  await enqueueMessage({ id: 2, text: 'World' });
  
  const msg1 = await dequeueMessage();
  const msg2 = await dequeueMessage();
  
  console.log(`✓ Dequeued messages:`);
  console.log(`  ${msg1.id}: ${msg1.text}`);
  console.log(`  ${msg2.id}: ${msg2.text}`);

  // 10. Blocking Operations
  console.log('\n10. Blocking List Operations:');
  
  const blockingQueue = 'blocking:queue';
  
  // Schedule a push after 1 second
  setTimeout(async () => {
    await client.rPush(blockingQueue, 'delayed-message');
  }, 500);

  console.log('  Waiting for message (with 2s timeout)...');
  
  // This will block until message arrives or timeout
  const result = await client.blPop(blockingQueue, 2);
  if (result) {
    console.log(`✓ Blocking pop received: ${result.element}`);
  }

  // 11. List as Activity Feed
  console.log('\n11. Activity Feed Pattern:');
  
  const feedKey = 'user:1:feed';
  
  async function addFeedItem(userId, activity) {
    const feed = `user:${userId}:feed`;
    const item = {
      timestamp: Date.now(),
      activity,
      id: Math.random().toString(36).substring(7)
    };
    await client.lPush(feed, JSON.stringify(item));
    
    // Keep only last 100 items
    await client.lTrim(feed, 0, 99);
  }

  await addFeedItem(1, 'Liked a post');
  await addFeedItem(1, 'Followed user');
  await addFeedItem(1, 'Commented on post');
  
  const feed = await client.lRange(feedKey, 0, 2);
  console.log(`✓ Recent activities:`);
  feed.forEach((item, idx) => {
    const parsed = JSON.parse(item);
    console.log(`  ${idx + 1}. ${parsed.activity}`);
  });

  // 12. Atomic Operations (List as Counter)
  console.log('\n12. List as Work Queue:');
  
  const workQueue = 'work:items';
  
  // Add work items
  for (let i = 1; i <= 5; i++) {
    await client.rPush(workQueue, `work:${i}`);
  }

  // Process work atomically
  const workItem = await client.lPop(workQueue);
  if (workItem) {
    console.log(`✓ Processing: ${workItem}`);
    
    // Add to processing queue
    await client.lPush('work:processing', workItem);
  }

  const queueLength = await client.lLen(workQueue);
  console.log(`  Remaining work items: ${queueLength}`);

  console.log('\n=== LIST DATA STRUCTURE COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
