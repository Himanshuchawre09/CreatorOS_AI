import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { User, Campaign, BrandProfile } from '../models';

describe('Phase 1 - Campaigns Management Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_campaigns_suite_12345';
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
    await Campaign.deleteMany({});
    await BrandProfile.deleteMany({});
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

  it('unauthenticated user receives 401 on campaign endpoints', async () => {
    const resList = await request(app).get('/api/campaigns');
    expect(resList.status).toBe(401);

    const resCreate = await request(app).post('/api/campaigns').send({ title: 'Test' });
    expect(resCreate.status).toBe(401);
  });

  it('brand can create a valid campaign with deliverables', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_camp@test.com', 'Apex Labs');

    const res = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'Summer Audio Showcase 2026',
        brief: 'Seeking tech and audio creators for a 60-second dedicated review of our wireless headphones.',
        goals: ['Brand Awareness', 'Conversion'],
        audience: 'Tech enthusiasts, remote workers, students',
        deliverables: [
          { type: 'YouTube Dedicated Video', count: 1, details: '60-90s integration segment' },
          { type: 'Instagram Reel', count: 2, details: 'Product unboxing and acoustic test' },
        ],
        budget: 2500,
        currency: 'USD',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Summer Audio Showcase 2026');
    expect(res.body.data.status).toBe('open');
    expect(res.body.data.deliverables.length).toBe(2);
  });

  it('non-brand (e.g. creator) cannot create a campaign (403)', async () => {
    const { cookie: creatorCookie } = await registerUser('creator', 'creator_camp@test.com');

    const res = await request(app)
      .post('/api/campaigns')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Hacked Campaign',
        brief: 'Brief text',
        audience: 'Audience text',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 1000,
        deadline: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
  });

  it('unknown body fields are rejected with 400 (.strict())', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'strict_camp@test.com');

    const res = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'Valid Title',
        brief: 'Valid brief',
        audience: 'Valid audience',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 1000,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        brand: '6ad58c31e2d7253ba774e96d', // Injected brand field
        hackerField: true,
      });

    expect(res.status).toBe(400);
  });

  it('creator can list and view OPEN campaigns only; draft campaigns return 404 to non-owners', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_host@test.com');
    const { cookie: creatorCookie } = await registerUser('creator', 'creator_browse@test.com');

    // 1. Create an OPEN campaign
    const openRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'Open Campaign 1',
        brief: 'Publicly open campaign for creators',
        audience: 'General',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 1500,
        deadline: new Date(Date.now() + 864000000).toISOString(),
        status: 'open',
      });
    const openId = openRes.body.data._id;

    // 2. Create a DRAFT campaign
    const draftRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'Draft Secret Campaign',
        brief: 'Internal planning draft',
        audience: 'Internal',
        deliverables: [{ type: 'Post', count: 1 }],
        budget: 5000,
        deadline: new Date(Date.now() + 864000000).toISOString(),
        status: 'draft',
      });
    const draftId = draftRes.body.data._id;

    // Creator lists campaigns -> gets only OPEN campaign
    const creatorList = await request(app)
      .get('/api/campaigns')
      .set('Cookie', creatorCookie);

    expect(creatorList.status).toBe(200);
    expect(creatorList.body.data.length).toBe(1);
    expect(creatorList.body.data[0].title).toBe('Open Campaign 1');

    // Creator can view OPEN campaign detail
    const creatorViewOpen = await request(app)
      .get(`/api/campaigns/${openId}`)
      .set('Cookie', creatorCookie);
    expect(creatorViewOpen.status).toBe(200);
    expect(creatorViewOpen.body.data.title).toBe('Open Campaign 1');

    // Creator cannot view DRAFT campaign detail -> 404
    const creatorViewDraft = await request(app)
      .get(`/api/campaigns/${draftId}`)
      .set('Cookie', creatorCookie);
    expect(creatorViewDraft.status).toBe(404);

    // Brand owner CAN view draft campaign detail
    const brandViewDraft = await request(app)
      .get(`/api/campaigns/${draftId}`)
      .set('Cookie', brandCookie);
    expect(brandViewDraft.status).toBe(200);
    expect(brandViewDraft.body.data.title).toBe('Draft Secret Campaign');
  });

  it('another brand cannot view private draft or edit someone elses campaign (403/404)', async () => {
    const { cookie: brandA } = await registerUser('brand', 'brand_a@test.com');
    const { cookie: brandB } = await registerUser('brand', 'brand_b@test.com');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandA)
      .send({
        title: 'Brand A Exclusive Draft',
        brief: 'Brief text',
        audience: 'Audience text',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 1000,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft',
      });
    const campId = campRes.body.data._id;

    // Brand B attempts to view Brand A's draft -> 404
    const viewRes = await request(app)
      .get(`/api/campaigns/${campId}`)
      .set('Cookie', brandB);
    expect(viewRes.status).toBe(404);

    // Brand B attempts to edit Brand A's campaign -> 403
    const editRes = await request(app)
      .put(`/api/campaigns/${campId}`)
      .set('Cookie', brandB)
      .send({ title: 'Hijacked Title' });
    expect(editRes.status).toBe(403);
  });

  it('enforces legal status transitions server-side', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_lifecycle@test.com');

    // Start in draft
    const createRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'Lifecycle Campaign',
        brief: 'Testing transitions',
        audience: 'Testers',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 2000,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft',
      });
    const campId = createRes.body.data._id;

    // draft -> inProgress is illegal (must be opened first)
    const illegal1 = await request(app)
      .put(`/api/campaigns/${campId}`)
      .set('Cookie', brandCookie)
      .send({ status: 'inProgress' });
    expect(illegal1.status).toBe(400);

    // draft -> open is legal
    const toOpen = await request(app)
      .put(`/api/campaigns/${campId}`)
      .set('Cookie', brandCookie)
      .send({ status: 'open' });
    expect(toOpen.status).toBe(200);
    expect(toOpen.body.data.status).toBe('open');

    // open -> inProgress is legal
    const toProgress = await request(app)
      .put(`/api/campaigns/${campId}`)
      .set('Cookie', brandCookie)
      .send({ status: 'inProgress' });
    expect(toProgress.status).toBe(200);
    expect(toProgress.body.data.status).toBe('inProgress');

    // inProgress -> completed is legal
    const toCompleted = await request(app)
      .put(`/api/campaigns/${campId}`)
      .set('Cookie', brandCookie)
      .send({ status: 'completed' });
    expect(toCompleted.status).toBe(200);
    expect(toCompleted.body.data.status).toBe('completed');

    // completed -> draft is illegal (terminal state)
    const toDraftFromCompleted = await request(app)
      .put(`/api/campaigns/${campId}`)
      .set('Cookie', brandCookie)
      .send({ status: 'draft' });
    expect(toDraftFromCompleted.status).toBe(400);
  });

  it('brand can delete draft and cancel open campaigns', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_del@test.com');

    // 1. Delete draft
    const draftRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'To Be Deleted',
        brief: 'Brief text',
        audience: 'Audience text',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 500,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft',
      });
    const draftId = draftRes.body.data._id;

    const delDraft = await request(app)
      .delete(`/api/campaigns/${draftId}`)
      .set('Cookie', brandCookie);
    expect(delDraft.status).toBe(200);
    expect(await Campaign.findById(draftId)).toBeNull();

    // 2. Cancel open campaign
    const openRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brandCookie)
      .send({
        title: 'To Be Cancelled',
        brief: 'Brief text',
        audience: 'Audience text',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 1200,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'open',
      });
    const openId = openRes.body.data._id;

    const delOpen = await request(app)
      .delete(`/api/campaigns/${openId}`)
      .set('Cookie', brandCookie);
    expect(delOpen.status).toBe(200);

    const cancelledCamp = await Campaign.findById(openId);
    expect(cancelledCamp?.status).toBe('cancelled');
  });
});
