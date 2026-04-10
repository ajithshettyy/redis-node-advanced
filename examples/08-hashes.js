import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Hash Data Structure Operations
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== HASH DATA STRUCTURE ===\n');

  // 1. Basic Hash Operations
  console.log('1. Basic Hash Operations:');
  
  const userKey = 'user:1000';
  await client.hSet(userKey, {
    name: 'John Doe',
    email: 'john@example.com',
    age: '30',
    country: 'USA'
  });
  console.log('✓ Created user hash');

  // Get all fields
  const userAll = await client.hGetAll(userKey);
  console.log('✓ User data:', userAll);

  // 2. Get Specific Fields
  console.log('\n2. Get Specific Fields:');
  
  const name = await client.hGet(userKey, 'name');
  console.log(`  User name: ${name}`);

  const emailAge = await client.hMGet(userKey, ['email', 'age']);
  console.log(`  Email and Age: ${JSON.stringify(emailAge)}`);

  // 3. Check Field Existence
  console.log('\n3. Field Existence:');
  
  const nameExists = await client.hExists(userKey, 'name');
  const phoneExists = await client.hExists(userKey, 'phone');
  console.log(`  'name' exists: ${nameExists === 1}`);
  console.log(`  'phone' exists: ${phoneExists === 1}`);

  // 4. Get Field Count and Names
  console.log('\n4. Hash Field Information:');
  
  const fieldCount = await client.hLen(userKey);
  console.log(`✓ Total fields: ${fieldCount}`);

  const fieldNames = await client.hKeys(userKey);
  console.log(`✓ Field names: ${fieldNames.join(', ')}`);

  const values = await client.hVals(userKey);
  console.log(`✓ Field values: ${values.join(', ')}`);

  // 5. Numeric Operations on Hash Fields
  console.log('\n5. Numeric Operations:');
  
  await client.hSet('product:1', {
    name: 'Laptop',
    price: '999.99',
    stock: '10',
    rating: '4.5'
  });

  // Increment integer field
  const newStock = await client.hIncrBy('product:1', 'stock', 5);
  console.log(`✓ Stock after increment: ${newStock}`);

  // Increment float field
  const newRating = await client.hIncrByFloat('product:1', 'rating', 0.2);
  console.log(`✓ Rating after increment: ${newRating}`);

  // 6. Update and Delete Fields
  console.log('\n6. Update and Delete:');
  
  // Update single field
  await client.hSet(userKey, 'age', '31');
  console.log(`✓ Updated age to 31`);

  // Delete fields
  const deleted = await client.hDel(userKey, ['country']);
  console.log(`✓ Deleted ${deleted} field(s)`);

  // 7. String Append in Hash
  console.log('\n7. String Append:');
  
  await client.hSet('article:1', 'content', 'Hello');
  await client.hStrLen('article:1', 'content'); // Get length before
  
  const appendLen = await client.hAppend('article:1', 'content', ' World!');
  console.log(`✓ After append, field length: ${appendLen}`);

  const content = await client.hGet('article:1', 'content');
  console.log(`  Content: ${content}`);

  // 8. Store Complex Objects as Hash
  console.log('\n8. Complex Object Storage:');
  
  const userProfile = 'user:2000:profile';
  const profile = {
    displayName: 'Jane Smith',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Developer and Designer',
    followers: '150',
    following: '200',
    verified: 'true'
  };

  await client.hSet(userProfile, profile);
  
  const retrievedProfile = await client.hGetAll(userProfile);
  console.log(`✓ Stored and retrieved profile:`, retrievedProfile);

  // 9. Batch Operations
  console.log('\n9. Batch Hash Operations:');
  
  const products = [
    { id: 1, name: 'Product A', price: '10', stock: '100' },
    { id: 2, name: 'Product B', price: '20', stock: '50' },
    { id: 3, name: 'Product C', price: '30', stock: '25' }
  ];

  for (const product of products) {
    const key = `product:${product.id}`;
    await client.hSet(key, {
      name: product.name,
      price: product.price,
      stock: product.stock
    });
  }

  console.log(`✓ Stored ${products.length} products`);

  // Retrieve all products
  for (const product of products) {
    const key = `product:${product.id}`;
    const data = await client.hGetAll(key);
    console.log(`  Product ${product.id}: ${data.name} - $${data.price}`);
  }

  // 10. Session Storage with Hash
  console.log('\n10. Session Storage with Hash:');
  
  const sessionId = 'session:abc123';
  const sessionData = {
    userId: '1000',
    username: 'john_doe',
    loginTime: new Date().toISOString(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    lastActivity: new Date().toISOString()
  };

  await client.hSet(sessionId, sessionData);
  await client.expire(sessionId, 3600); // 1 hour expiration
  
  console.log(`✓ Session created with TTL: 3600s`);

  // Update last activity
  await client.hSet(sessionId, 'lastActivity', new Date().toISOString());
  console.log(`✓ Updated last activity timestamp`);

  // 11. User Preferences as Hash
  console.log('\n11. User Preferences:');
  
  const preferencesKey = 'user:1000:preferences';
  const preferences = {
    theme: 'dark',
    language: 'en',
    notifications: 'enabled',
    emailNotifications: 'weekly',
    twoFactorAuth: 'enabled',
    timezone: 'UTC-5'
  };

  await client.hSet(preferencesKey, preferences);
  
  // Get specific preferences
  const theme = await client.hGet(preferencesKey, 'theme');
  const notifications = await client.hGet(preferencesKey, 'notifications');
  
  console.log(`✓ Theme: ${theme}, Notifications: ${notifications}`);

  // 12. Statistics Tracking with Hash
  console.log('\n12. Statistics Tracking:');
  
  const statsKey = 'stats:daily:2024-04-10';
  await client.hSet(statsKey, {
    pageViews: '10000',
    uniqueVisitors: '5000',
    clickThroughs: '2500',
    conversions: '100',
    revenue: '5000.50'
  });

  // Increment daily stats
  await client.hIncrBy(statsKey, 'pageViews', 100);
  await client.hIncrBy(statsKey, 'conversions', 5);

  const stats = await client.hGetAll(statsKey);
  console.log(`✓ Daily stats:`, stats);

  // 13. Scan Hash for Iteration
  console.log('\n13. Scan Hash (For Large Hashes):');
  
  // Create a large hash
  const largeHashKey = 'large:hash';
  const hashData = {};
  
  for (let i = 0; i < 100; i++) {
    hashData[`field:${i}`] = `value:${i}`;
  }
  
  await client.hSet(largeHashKey, hashData);
  console.log(`✓ Created hash with 100 fields`);

  // Scan through hash
  let cursor = '0';
  let scannedCount = 0;
  
  do {
    const result = await client.hScan(largeHashKey, cursor, { COUNT: 10 });
    cursor = result.cursor;
    scannedCount += result.tuples.length;
  } while (cursor !== '0');

  console.log(`✓ Scanned ${scannedCount} fields total`);

  console.log('\n=== HASH DATA STRUCTURE COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
