import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Session Management with Redis
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== SESSION MANAGEMENT ===\n');

  // 1. Basic Session Storage
  console.log('1. Basic Session Storage:');
  const sessionId = 'sess:' + Math.random().toString(36).substring(7);
  const sessionData = {
    userId: 123,
    username: 'john_doe',
    loginTime: new Date().toISOString(),
    permissions: ['read', 'write']
  };

  // Store session with 24 hour expiration
  await client.setEx(sessionId, 86400, JSON.stringify(sessionData));
  console.log(`✓ Session created: ${sessionId}`);
  console.log(`  Session data stored with 24h expiration`);

  // 2. Retrieve Session
  console.log('\n2. Retrieve Session:');
  const retrievedSession = await client.get(sessionId);
  const session = JSON.parse(retrievedSession);
  console.log(`✓ Retrieved session for user: ${session.username}`);
  console.log(`  Permissions: ${session.permissions.join(', ')}`);

  // 3. Session Update (Touch/Extend TTL)
  console.log('\n3. Session TTL Management:');
  let ttl = await client.ttl(sessionId);
  console.log(`  Current TTL: ${ttl}s`);
  
  // Extend session (touch)
  await client.expire(sessionId, 86400);
  ttl = await client.ttl(sessionId);
  console.log(`✓ Extended TTL: ${ttl}s`);

  // 4. Active Sessions Tracking
  console.log('\n4. Track Active Sessions:');
  const activeSessionKey = 'active:sessions';
  
  async function createUserSession(userId, username) {
    const sid = `sess:${Date.now()}:${userId}`;
    const data = { userId, username, createdAt: new Date().toISOString() };
    
    // Store session data
    await client.setEx(sid, 3600, JSON.stringify(data));
    
    // Track in active sessions set
    await client.sAdd(activeSessionKey, sid);
    
    return sid;
  }

  const sess1 = await createUserSession(1, 'alice');
  const sess2 = await createUserSession(2, 'bob');
  const sess3 = await createUserSession(3, 'charlie');

  const activeSessions = await client.sCard(activeSessionKey);
  console.log(`✓ Active sessions: ${activeSessions}`);

  // 5. User's Active Sessions
  console.log('\n5. Get All Sessions for User:');
  
  async function getUserSessions(userId) {
    const userSessionKey = `user:${userId}:sessions`;
    const sessionIds = await client.lRange(userSessionKey, 0, -1);
    
    const sessions = [];
    for (const sessionId of sessionIds) {
      const sessionData = await client.get(sessionId);
      if (sessionData) {
        sessions.push(JSON.parse(sessionData));
      }
    }
    return sessions;
  }

  async function createUserSessionWithTracking(userId, username) {
    const sid = `sess:${Date.now()}:${userId}`;
    const data = { userId, username, createdAt: new Date().toISOString() };
    
    await client.setEx(sid, 3600, JSON.stringify(data));
    
    // Store session ID in user's session list
    const userSessionKey = `user:${userId}:sessions`;
    await client.rPush(userSessionKey, sid);
    await client.expire(userSessionKey, 86400);
    
    return sid;
  }

  await createUserSessionWithTracking(5, 'david');
  const userSessions = await getUserSessions(5);
  console.log(`✓ User 5 has ${userSessions.length} session(s)`);

  // 6. Session Logout (Blacklist)
  console.log('\n6. Session Logout with Blacklist:');
  const testSession = await createUserSessionWithTracking(6, 'eve');
  
  async function logoutSession(sessionId) {
    const blacklistKey = 'session:blacklist';
    const ttl = await client.ttl(sessionId);
    
    // Add to blacklist with same TTL
    if (ttl > 0) {
      await client.setEx(`${blacklistKey}:${sessionId}`, ttl, '1');
    }
    
    // Remove from active sessions
    const sessionData = await client.get(sessionId);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      await client.sRem(activeSessionKey, sessionId);
    }
    
    // Delete session
    await client.del(sessionId);
    console.log(`✓ Session ${sessionId} logged out and blacklisted`);
  }

  async function isSessionBlacklisted(sessionId) {
    const blacklistKey = 'session:blacklist';
    const result = await client.get(`${blacklistKey}:${sessionId}`);
    return result !== null;
  }

  await logoutSession(testSession);
  const isBlacklisted = await isSessionBlacklisted(testSession);
  console.log(`  Is blacklisted: ${isBlacklisted}`);

  // 7. Session Analytics
  console.log('\n7. Session Analytics:');
  const totalActiveSessions = await client.sCard(activeSessionKey);
  console.log(`✓ Total active sessions: ${totalActiveSessions}`);

  // Store session creation time metrics
  const sessionMetricsKey = 'sessions:created';
  await client.incr(sessionMetricsKey);
  const sessionsCreated = await client.get(sessionMetricsKey);
  console.log(`✓ Total sessions created (today): ${sessionsCreated}`);

  console.log('\n=== SESSION MANAGEMENT COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
