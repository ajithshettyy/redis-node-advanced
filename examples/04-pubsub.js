import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Pub/Sub (Publish/Subscribe) Messaging
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== PUB/SUB MESSAGING ===\n');

  // 1. Basic Pub/Sub
  console.log('1. Basic Pub/Sub:');
  
  // Create subscriber
  const subscriber = client.duplicate();
  await subscriber.connect();

  // Subscribe to channel
  await subscriber.subscribe('news', (message) => {
    console.log(`  📨 Received on 'news': ${message}`);
  });

  await subscriber.subscribe('alerts', (message) => {
    console.log(`  🚨 Received on 'alerts': ${message}`);
  });

  console.log('✓ Subscribed to channels: news, alerts');

  // Give subscriber time to process subscriptions
  await new Promise(resolve => setTimeout(resolve, 100));

  // Publish messages
  console.log('\n2. Publishing Messages:');
  await client.publish('news', 'Breaking news: Redis is awesome!');
  await client.publish('news', 'Tech update: Node.js 20 released');
  await client.publish('alerts', 'System maintenance scheduled');

  // Wait for messages to be processed
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Pattern-Based Subscription
  console.log('\n3. Pattern-Based Subscription:');
  const subscriber2 = client.duplicate();
  await subscriber2.connect();

  await subscriber2.pSubscribe('user:*', (message, channel) => {
    console.log(`  👤 Pattern matched - Channel: ${channel}, Message: ${message}`);
  });

  console.log('✓ Subscribed to pattern: user:*');

  await new Promise(resolve => setTimeout(resolve, 100));

  await client.publish('user:login', 'User john logged in');
  await client.publish('user:logout', 'User jane logged out');
  await client.publish('admin:action', 'Admin action (should not match pattern)');

  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. Pub/Sub with JSON Data
  console.log('\n4. Pub/Sub with JSON Data:');
  const subscriber3 = client.duplicate();
  await subscriber3.connect();

  await subscriber3.subscribe('order:events', (message) => {
    const event = JSON.parse(message);
    console.log(`  📦 Order Event: ${event.type} - Order #${event.orderId}`);
  });

  console.log('✓ Subscribed to order:events');

  await new Promise(resolve => setTimeout(resolve, 100));

  const orderEvent1 = JSON.stringify({ type: 'CREATED', orderId: 101, amount: 99.99 });
  const orderEvent2 = JSON.stringify({ type: 'SHIPPED', orderId: 101, trackingId: 'TRACK123' });
  
  await client.publish('order:events', orderEvent1);
  await client.publish('order:events', orderEvent2);

  await new Promise(resolve => setTimeout(resolve, 500));

  // 5. Pub/Sub Channel Statistics
  console.log('\n5. Pub/Sub Statistics:');
  
  // Query actual Redis subscription data
  try {
    // Get all active channels with subscribers
    const channels = await client.sendCommand(['PUBSUB', 'CHANNELS']);
    console.log('✓ Active Channels (from Redis server):');
    if (channels && channels.length > 0) {
      channels.forEach((channel) => {
        console.log(`    ${channel}`);
      });
    } else {
      console.log('    (no channels found)');
    }

    // Get subscriber count for specific channels
    if (channels && channels.length > 0) {
      const numsub = await client.sendCommand(['PUBSUB', 'NUMSUB', ...channels]);
      console.log('✓ Subscribers per channel:');
      for (let i = 0; i < numsub.length; i += 2) {
        console.log(`    ${numsub[i]}: ${numsub[i + 1]} subscriber(s)`);
      }
    }

    // Get number of pattern subscriptions
    const numpat = await client.sendCommand(['PUBSUB', 'NUMPAT']);
    console.log(`✓ Pattern Subscriptions: ${numpat}`);
    
    console.log(`✓ Total subscriptions tracked: ${(channels?.length || 0) + numpat}`);
  } catch (err) {
    console.log('Note: Direct Redis subscription queries may require admin access');
    console.log('Local tracking:');
    activeSubscriptions.channels.forEach((channel) => {
      console.log(`    ${channel}: 1 subscriber`);
    });
    activeSubscriptions.patterns.forEach((pattern) => {
      console.log(`    ${pattern}: 1 subscriber`);
    });
  }

  // 6. Pub/Sub for Real-Time Notifications
  console.log('\n6. Real-Time Notifications:');
  const subscriber4 = client.duplicate();
  await subscriber4.connect();

  const notifications = [];
  await subscriber4.subscribe('notifications:user:123', (message) => {
    notifications.push(message);
    console.log(`  🔔 Notification: ${message}`);
  });

  console.log('✓ Subscribed to user notifications');

  await new Promise(resolve => setTimeout(resolve, 100));

  // Simulate notification events
  await client.publish('notifications:user:123', 'You have a new message');
  await client.publish('notifications:user:123', 'Your order has been shipped');

  await new Promise(resolve => setTimeout(resolve, 500));

  // 7. Unsubscribe
  console.log('\n7. Unsubscribe:');
  await subscriber.unsubscribe('news');
  console.log('✓ Unsubscribed from news channel');

  await new Promise(resolve => setTimeout(resolve, 200));

  // Clean up
  await subscriber.quit();
  await subscriber2.quit();
  await subscriber3.quit();
  await subscriber4.quit();

  console.log('\n=== PUB/SUB COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
