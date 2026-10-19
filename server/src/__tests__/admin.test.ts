import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import { createApp } from '../app';
import {
  User,
  CreatorProfile,
  BrandProfile,
  Campaign,
  Contract,
  Submission,
  TalentLink,
} from '../models';

describe('Phase 10 - Role Dashboards & Admin Console Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_admin_suite_12345';
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
    await CreatorProfile.deleteMany({});
    await BrandProfile.deleteMany({});
    await Campaign.deleteMany({});
    await Contract.deleteMany({});
    await Submission.deleteMany({});
    await TalentLink.deleteMany({});
  });

  const registerUser = async (
    role: 'creator' | 'brand' | 'freelancer' | 'talentManager',
    email: string,
    name = 'Test User'
  ) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name,
        email,
        password: 'Password123',
        role,
      });
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie'],
    };
  };

  const createAdminUser = async (email = 'admin@platform.com') => {
    const passwordHash = await bcrypt.hash('AdminPassword123', 12);
    const admin = await User.create({
      name: 'System Admin',
      email,
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'AdminPassword123',
      });

    return {
      user: admin,
      cookie: loginRes.headers['set-cookie'],
    };
  };

  it('admin routes reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('admin routes reject non-admin roles with 403', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_test@test.com');
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', brandCookie);

    expect(res.status).toBe(403);
  });

  it('admin can list and search users with pagination', async () => {
    const admin = await createAdminUser();
    await registerUser('creator', 'creator1@test.com', 'Alice Creator');
    await registerUser('brand', 'brand1@test.com', 'Acme Brand');

    const res = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Cookie', admin.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);

    // Search query test
    const searchRes = await request(app)
      .get('/api/admin/users?q=Alice')
      .set('Cookie', admin.cookie);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBe(1);
    expect(searchRes.body.data[0].name).toBe('Alice Creator');
  });

  it('admin can suspend and reactivate a user, blocking suspended logins', async () => {
    const admin = await createAdminUser();
    const { user: creatorUser, cookie: creatorCookie } = await registerUser(
      'creator',
      'creator_suspend@test.com',
      'Target User'
    );

    // 1. Admin suspends creator
    const suspendRes = await request(app)
      .put(`/api/admin/users/${creatorUser._id || creatorUser.id}/status`)
      .set('Cookie', admin.cookie)
      .send({ status: 'suspended' });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.status).toBe('suspended');

    // 2. Suspended user's existing session is rejected with 403
    const pingRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', creatorCookie);
    expect(pingRes.status).toBe(403);
    expect(pingRes.body.message).toContain('suspended');

    // 3. Suspended user cannot log in
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'creator_suspend@test.com',
        password: 'Password123',
      });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toContain('suspended');

    // 4. Admin reactivates user
    const reactivateRes = await request(app)
      .put(`/api/admin/users/${creatorUser._id || creatorUser.id}/status`)
      .set('Cookie', admin.cookie)
      .send({ status: 'active' });

    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.data.status).toBe('active');

    // 5. User can log in again
    const loginSuccessRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'creator_suspend@test.com',
        password: 'Password123',
      });
    expect(loginSuccessRes.status).toBe(200);
  });

  it('admin cannot suspend their own admin account (400)', async () => {
    const admin = await createAdminUser('self_suspend@platform.com');
    const res = await request(app)
      .put(`/api/admin/users/${admin.user._id}/status`)
      .set('Cookie', admin.cookie)
      .send({ status: 'suspended' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot suspend your own admin account');
  });

  it('admin can view platform aggregates and metrics', async () => {
    const admin = await createAdminUser();
    await registerUser('creator', 'c_stat@test.com');
    await registerUser('brand', 'b_stat@test.com');

    const res = await request(app)
      .get('/api/admin/platform-stats')
      .set('Cookie', admin.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.total).toBeGreaterThanOrEqual(3);
    expect(res.body.data.users.byRole.creator).toBeGreaterThanOrEqual(1);
    expect(res.body.data.users.byRole.brand).toBeGreaterThanOrEqual(1);
  });

  it('admin can toggle public profile visibility', async () => {
    const admin = await createAdminUser();
    const { user: creatorUser } = await registerUser('creator', 'c_vis@test.com');
    const profile = await CreatorProfile.create({
      user: creatorUser._id || creatorUser.id,
      displayName: 'Visibility Test',
      niche: 'Lifestyle',
      platforms: [{ platform: 'youtube', handle: '@vis', url: 'https://youtube.com/@vis', followers: 100 }],
      isPublic: true,
    });

    const hideRes = await request(app)
      .put(`/api/admin/profiles/creator/${profile._id}/visibility`)
      .set('Cookie', admin.cookie)
      .send({ isPublic: false });

    expect(hideRes.status).toBe(200);
    expect(hideRes.body.data.isPublic).toBe(false);
  });

  it('Talent Manager can invite a creator, and creator can accept or decline', async () => {
    const { user: managerUser, cookie: managerCookie } = await registerUser(
      'talentManager',
      'manager@agency.com',
      'Manager Jane'
    );
    const { user: creatorUser, cookie: creatorCookie } = await registerUser(
      'creator',
      'creator_link@test.com',
      'Creator Tom'
    );

    // 1. Manager invites creator
    const inviteRes = await request(app)
      .post('/api/talent-links/invite')
      .set('Cookie', managerCookie)
      .send({
        creatorEmail: 'creator_link@test.com',
        notes: 'We would love to represent you for upcoming brand deals.',
      });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.data.status).toBe('pending');
    const linkId = inviteRes.body.data._id;

    // 2. Duplicate invite is rejected with 409
    const dupRes = await request(app)
      .post('/api/talent-links/invite')
      .set('Cookie', managerCookie)
      .send({
        creatorId: (creatorUser._id || creatorUser.id).toString(),
      });
    expect(dupRes.status).toBe(409);

    // 3. Creator lists incoming representation links
    const listRes = await request(app)
      .get('/api/talent-links')
      .set('Cookie', creatorCookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);

    // 4. Outsider cannot respond to invite (403)
    const { cookie: outsiderCookie } = await registerUser('brand', 'outsider@brand.com');
    const outsiderRes = await request(app)
      .put(`/api/talent-links/${linkId}/respond`)
      .set('Cookie', outsiderCookie)
      .send({ action: 'accept' });
    expect(outsiderRes.status).toBe(403);

    // 5. Creator accepts invite
    const acceptRes = await request(app)
      .put(`/api/talent-links/${linkId}/respond`)
      .set('Cookie', creatorCookie)
      .send({ action: 'accept' });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('accepted');

    // 6. Talent manager dashboard shows roster count
    const statsRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Cookie', managerCookie);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.kpis.rosterCount).toBe(1);
  });

  it('operator-injection query parameter on admin users endpoint is rejected with 400', async () => {
    const admin = await createAdminUser();
    const res = await request(app)
      .get('/api/admin/users?role[$ne]=admin')
      .set('Cookie', admin.cookie);

    expect(res.status).toBe(400);
  });
});
