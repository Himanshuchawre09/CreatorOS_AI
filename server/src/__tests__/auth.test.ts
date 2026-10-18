import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import { createApp } from '../app';
import { User } from '../models/user.model';
import { env } from '../config/env';

describe('Auth & Authorization Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_auth_suite_12345';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = createApp();
  }, 300000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('register success: creates user, sets httpOnly cookie, and never returns passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Lee',
        email: 'jordan@creator.com',
        password: 'Password123',
        role: 'creator',
        orgName: 'Apex Studio',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Jordan Lee');
    expect(res.body.user.email).toBe('jordan@creator.com');
    expect(res.body.user.role).toBe('creator');
    expect(res.body.user.orgName).toBe('Apex Studio');
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify httpOnly cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = (Array.isArray(cookies) ? cookies : [cookies]).find((c) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain('HttpOnly');
    expect(tokenCookie?.toLowerCase()).toContain('samesite=lax');
  });

  it('duplicate email: rejects registration with 409 conflict', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Lee',
        email: 'jordan@creator.com',
        password: 'Password123',
        role: 'creator',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Duplicate',
        email: 'JORDAN@creator.com', // test lowercase normalization
        password: 'Password456',
        role: 'creator',
      });

    expect([400, 409]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('admin role rejected on register: returns 403 or 400 when attempting to register as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Malicious Admin',
        email: 'admin_attempt@test.com',
        password: 'Password123',
        role: 'admin',
      });

    expect([400, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);

    const userInDb = await User.findOne({ email: 'admin_attempt@test.com' });
    expect(userInDb).toBeNull();
  });

  it('weak password rejected: rejects passwords without letters, numbers, or < 8 chars', async () => {
    // Too short
    const resShort = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'short@test.com',
        password: 'Pass1',
        role: 'freelancer',
      });
    expect(resShort.status).toBe(400);
    expect(resShort.body.success).toBe(false);

    // No numbers
    const resNoNum = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'nonum@test.com',
        password: 'PasswordOnly',
        role: 'freelancer',
      });
    expect(resNoNum.status).toBe(400);
    expect(resNoNum.body.success).toBe(false);

    // No letters
    const resNoLetters = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'noletters@test.com',
        password: '1234567890',
        role: 'freelancer',
      });
    expect(resNoLetters.status).toBe(400);
    expect(resNoLetters.body.success).toBe(false);
  });

  it('login success sets cookie: returns 200, sets httpOnly cookie, and returns sanitized user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Taylor Swift',
        email: 'taylor@brand.com',
        password: 'SecretPassword99',
        role: 'brand',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'taylor@brand.com',
        password: 'SecretPassword99',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('taylor@brand.com');
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = (Array.isArray(cookies) ? cookies : [cookies]).find((c) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain('HttpOnly');
  });

  it('login wrong password: returns 401 with generic "Invalid email or password" error', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@test.com',
        password: 'ValidPassword1',
        role: 'freelancer',
      });

    // Wrong password for existing user
    const resWrongPass = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'WrongPassword999',
      });

    expect(resWrongPass.status).toBe(401);
    expect(resWrongPass.body.message).toBe('Invalid email or password');

    // Unknown email
    const resUnknownEmail = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'ValidPassword1',
      });

    expect(resUnknownEmail.status).toBe(401);
    expect(resUnknownEmail.body.message).toBe('Invalid email or password');
  });

  it('/me without cookie returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('/me with cookie returns the user without passwordHash', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Morgan Manager',
        email: 'morgan@agency.com',
        password: 'Password123',
        role: 'talentManager',
      });

    const cookie = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('morgan@agency.com');
    expect(res.body.user.role).toBe('talentManager');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('/api/admin/ping returns 403 for a creator and 200 for an admin', async () => {
    // 1. Creator user
    const creatorRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Creator Person',
        email: 'creator@ping.com',
        password: 'Password123',
        role: 'creator',
      });
    const creatorCookie = creatorRes.headers['set-cookie'];

    const forbiddenRes = await request(app)
      .get('/api/admin/ping')
      .set('Cookie', creatorCookie);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);

    // 2. Admin user (created directly in DB)
    const adminPasswordHash = await bcrypt.hash('AdminPassword123', 12);
    await User.create({
      name: 'Super Admin',
      email: 'admin@ping.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@ping.com',
        password: 'AdminPassword123',
      });
    const adminCookie = adminLoginRes.headers['set-cookie'];

    const successRes = await request(app)
      .get('/api/admin/ping')
      .set('Cookie', adminCookie);

    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body.message).toBe('pong');
  });

  it('GET /api/health public response returns only { status, timestamp }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body.database).toBeUndefined();
    expect(res.body.memory).toBeUndefined();
    expect(res.body.version).toBeUndefined();
  });

  it('GET /api/admin/diagnostics requires admin and returns detailed diagnostics', async () => {
    // Non-admin gets 403
    const creatorRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Creator Diag',
        email: 'creator@diag.com',
        password: 'Password123',
        role: 'creator',
      });
    const creatorCookie = creatorRes.headers['set-cookie'];

    const forbiddenRes = await request(app)
      .get('/api/admin/diagnostics')
      .set('Cookie', creatorCookie);
    expect(forbiddenRes.status).toBe(403);

    // Admin gets 200 with database and memory
    const adminPasswordHash = await bcrypt.hash('AdminPassword123', 12);
    await User.create({
      name: 'Diagnostics Admin',
      email: 'diagadmin@test.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'diagadmin@test.com',
        password: 'AdminPassword123',
      });
    const adminCookie = adminLoginRes.headers['set-cookie'];

    const successRes = await request(app)
      .get('/api/admin/diagnostics')
      .set('Cookie', adminCookie);

    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body.data.database).toBeDefined();
    expect(successRes.body.data.memory).toBeDefined();
  });

  it('confirms a 403 response has no "stack" key when NODE_ENV is production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    (env as any).NODE_ENV = 'production';

    try {
      const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Production Creator',
          email: 'prodcreator@test.com',
          password: 'Password123',
          role: 'creator',
        });
      const creatorCookie = creatorRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/admin/ping')
        .set('Cookie', creatorCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Access denied: insufficient permissions');
      expect(res.body).not.toHaveProperty('stack');
      expect(res.body.stack).toBeUndefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
      (env as any).NODE_ENV = originalEnv;
    }
  });
});


