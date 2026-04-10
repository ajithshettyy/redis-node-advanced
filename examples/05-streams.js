import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Redis Streams - Advanced data structure for time-series and event logs
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== REDIS STREAMS ===\n');

  // 1. Add entries to stream
  console.log('1. Create Stream and Add Entries:');
  const streamKey = 'events:temperature';

  const entry1 = await client.xAdd(streamKey, '*', {
    sensor: 'room1',
    temperature: '22.5',
    humidity: '65'
  });
  console.log(`✓ Added entry: ${entry1}`);

  const entry2 = await client.xAdd(streamKey, '*', {
    sensor: 'room2',
    temperature: '23.1',
    humidity: '68'
  });
  console.log(`✓ Added entry: ${entry2}`);

  const entry3 = await client.xAdd(streamKey, '*', {
    sensor: 'room1',
    temperature: '22.8',
    humidity: '66'
  });
  console.log(`✓ Added entry: ${entry3}`);

  // 2. Read stream entries
  console.log('\n2. Read Stream Entries:');
  
  // Get last 2 entries
  const recentEntries = await client.xRevRange(streamKey, '+', '-', { COUNT: 2 });
  console.log(`✓ Last 2 entries:`);
  recentEntries.forEach(entry => {
    console.log(`  ID: ${entry.id}, Data:`, entry.message);
  });

  // 3. Stream length
  console.log('\n3. Stream Information:');
  const streamLen = await client.xLen(streamKey);
  console.log(`✓ Stream length: ${streamLen} entries`);

  // 4. Range queries
  console.log('\n4. Read Range:');
  const allEntries = await client.xRange(streamKey, '-', '+');
  console.log(`✓ All entries in stream:`);
  allEntries.forEach(entry => {
    const data = entry.message;
    console.log(`  ${data.sensor}: ${data.temperature}°C`);
  });

  // 5. Consumer Groups for processing
  console.log('\n5. Consumer Groups:');
  
  // Create consumer group
  try {
    await client.xGroupCreate(streamKey, 'temperature-processors', '$', {
      MKSTREAM: true
    });
    console.log('✓ Created consumer group: temperature-processors');
  } catch (e) {
    console.log('✓ Consumer group already exists');
  }

  // Add more entries after group creation
  for (let i = 0; i < 3; i++) {
    await client.xAdd(streamKey, '*', {
      sensor: `sensor${i}`,
      temperature: `${20 + i}.${Math.floor(Math.random() * 10)}`,
      humidity: `${60 + i * 2}`
    });
  }

  // Read pending messages as consumer
  console.log('\n6. Consumer Reading with Acknowledgment:');
  const messages = await client.xReadGroup(
    { key: streamKey, group: 'temperature-processors', consumer: 'processor-1' },
    { COUNT: 2, BLOCK: 0 }
  );

  if (messages) {
    console.log(`✓ Consumer 'processor-1' read messages:`);
    messages.forEach(msg => {
      console.log(`  Message ID: ${msg.messages[0].id}`);
      console.log(`    ${JSON.stringify(msg.messages[0].message)}`);
    });

    // Acknowledge messages
    const msgIds = messages[0].messages.map(m => m.id);
    for (const msgId of msgIds) {
      await client.xAck(streamKey, 'temperature-processors', msgId);
    }
    console.log(`✓ Acknowledged ${msgIds.length} messages`);
  }

  // 7. Stream info and groups
  console.log('\n7. Stream and Group Information:');
  const streamInfo = await client.xInfo('STREAM', streamKey);
  console.log(`✓ Stream info:`, {
    'Length': streamInfo.length,
    'First entry': streamInfo['first-entry']?.id,
    'Last entry': streamInfo['last-entry']?.id
  });

  const groupInfo = await client.xInfo('GROUPS', streamKey);
  console.log(`✓ Consumer groups:`, groupInfo);

  // 8. XREAD with BLOCK (blocking read)
  console.log('\n8. Blocking Read (XREAD):');
  console.log('✓ Set up blocking consumer...');
  
  // Simulate new entry
  setTimeout(async () => {
    await client.xAdd(streamKey, '*', {
      sensor: 'urgent',
      temperature: '35.0',
      humidity: '90'
    });
  }, 1000);

  // This will wait for new entry (max 2 seconds)
  const blockingRead = await client.xRead(
    { key: streamKey, id: '$' },
    { BLOCK: 2000, COUNT: 1 }
  );

  if (blockingRead) {
    console.log(`✓ Received new entry:`);
    blockingRead.forEach(msg => {
      console.log(`  ${JSON.stringify(msg.messages[0].message)}`);
    });
  }

  // 9. Stream Trimming
  console.log('\n9. Stream Trimming:');
  const beforeLen = await client.xLen(streamKey);
  console.log(`  Entries before trim: ${beforeLen}`);
  
  // Keep only last 5 entries
  const trimmed = await client.xTrim(streamKey, 'MAXLEN', 5);
  const afterLen = await client.xLen(streamKey);
  console.log(`✓ Trimmed ${trimmed} entries`);
  console.log(`  Entries after trim: ${afterLen}`);

  // 10. Stream Monitoring Use Case
  console.log('\n10. Real-Time Monitoring Example:');
  const monitorStream = 'system:metrics';
  
  for (let i = 0; i < 3; i++) {
    await client.xAdd(monitorStream, '*', {
      timestamp: new Date().toISOString(),
      cpu: `${Math.random() * 100}%`,
      memory: `${Math.random() * 100}%`,
      disk: `${Math.random() * 100}%`
    });
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const metrics = await client.xRevRange(monitorStream, '+', '-', { COUNT: 3 });
  console.log(`✓ Last 3 metrics:`);
  metrics.forEach(m => {
    console.log(`  ${m.message.timestamp}: CPU=${m.message.cpu}, Memory=${m.message.memory}`);
  });

  console.log('\n=== REDIS STREAMS COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
