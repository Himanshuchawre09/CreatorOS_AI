import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { User, Campaign, CollaborationRequest } from '../models';

describe('Phase 2 - Collaboration Requests Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_requests_suite_12345';
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
    await CollaborationRequest.deleteMany({});
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

  const createTestCampaign = async (cookie: string, status: 'draft' | 'open' = 'open') => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Cookie', cookie)
      .send({
        title: 'Tech Review 2026',
        brief: 'Reviewing our next-gen headphones',
        audience: 'Tech lovers',
        deliverables: [{ type: 'Video', count: 1 }],
        budget: 2000,
        deadline: new Date(Date.now() + 864000000).toISOString(),
        status,
      });
    return res.body.data;
  };

  it('unauthenticated user receives 401 on collaboration requests endpoints', async () => {
    const resList = await request(app).get('/api/requests');
    expect(resList.status).toBe(401);

    const resCreate = await request(app)
      .post('/api/requests')
      .send({ campaignId: '6ad58db401e73f70ac152c69', recipientId: '6ad58db401e73f70ac152c70' });
    expect(resCreate.status).toBe(401);
  });

  it('brand can send collaboration request to creator for own campaign', async () => {
    const { cookie: brandCookie, user: brandUser } = await registerUser('brand', 'brand_req@test.com');
    const { cookie: creatorCookie, user: creatorUser } = await registerUser('creator', 'creator_req@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
        pitch: 'We love your content style and would love to feature you in this launch!',
        proposedRate: 2200,
        currency: 'USD',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.sender.toString()).toBe(brandUser._id.toString());
    expect(res.body.data.recipient.toString()).toBe(creatorUser._id.toString());
  });

  it('creator can apply to open campaign of a brand', async () => {
    const { cookie: brandCookie, user: brandUser } = await registerUser('brand', 'brand_open@test.com');
    const { cookie: creatorCookie, user: creatorUser } = await registerUser('creator', 'creator_app@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', creatorCookie)
      .send({
        campaignId: campaign._id,
        recipientId: brandUser._id,
        pitch: 'I have an active audience of 100k tech enthusiasts that fits your target audience perfectly.',
        proposedRate: 2000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.sender.toString()).toBe(creatorUser._id.toString());
    expect(res.body.data.recipient.toString()).toBe(brandUser._id.toString());
  });

  it('duplicate request between same campaign and creator is rejected with 409', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_dup@test.com');
    const { cookie: creatorCookie, user: creatorUser } = await registerUser('creator', 'creator_dup@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    // 1st request succeeds
    const firstRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
      });
    expect(firstRes.status).toBe(201);

    // 2nd request for same campaign + creator fails with 409 Conflict
    const secondRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
      });
    expect(secondRes.status).toBe(409);
  });

  it('creator cannot apply to a draft campaign (400)', async () => {
    const { cookie: brandCookie, user: brandUser } = await registerUser('brand', 'brand_draft@test.com');
    const { cookie: creatorCookie } = await registerUser('creator', 'creator_draft@test.com');

    const draftCampaign = await createTestCampaign(brandCookie, 'draft');

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', creatorCookie)
      .send({
        campaignId: draftCampaign._id,
        recipientId: brandUser._id,
      });

    expect(res.status).toBe(400);
  });

  it('brand cannot send request for another brands campaign (403)', async () => {
    const { cookie: brandA } = await registerUser('brand', 'brand_a_own@test.com');
    const { cookie: brandB } = await registerUser('brand', 'brand_b_own@test.com');
    const { user: creatorUser } = await registerUser('creator', 'creator_tgt@test.com');

    const campaignA = await createTestCampaign(brandA, 'open');

    // Brand B attempts to send request on Campaign A
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', brandB)
      .send({
        campaignId: campaignA._id,
        recipientId: creatorUser._id,
      });

    expect(res.status).toBe(403);
  });

  it('only recipient can accept or reject; sender receives 403', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_resp@test.com');
    const { cookie: creatorCookie, user: creatorUser } = await registerUser('creator', 'creator_resp@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    // Brand sends request to creator
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
      });
    const requestId = reqRes.body.data._id;

    // Sender (brand) tries to accept -> 403
    const senderTry = await request(app)
      .put(`/api/requests/${requestId}/respond`)
      .set('Cookie', brandCookie)
      .send({ action: 'accept' });
    expect(senderTry.status).toBe(403);

    // Recipient (creator) accepts -> 200
    const recipientAccept = await request(app)
      .put(`/api/requests/${requestId}/respond`)
      .set('Cookie', creatorCookie)
      .send({ action: 'accept' });
    expect(recipientAccept.status).toBe(200);
    expect(recipientAccept.body.data.status).toBe('accepted');
    expect(recipientAccept.body.data.respondedAt).toBeDefined();

    // Responding again after accepted returns 400
    const tryAgain = await request(app)
      .put(`/api/requests/${requestId}/respond`)
      .set('Cookie', creatorCookie)
      .send({ action: 'reject' });
    expect(tryAgain.status).toBe(400);
  });

  it('only sender can withdraw a request; recipient receives 403', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_wd@test.com');
    const { cookie: creatorCookie, user: creatorUser } = await registerUser('creator', 'creator_wd@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    // Brand sends request to creator
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
      });
    const requestId = reqRes.body.data._id;

    // Recipient (creator) tries to withdraw -> 403
    const recipientWd = await request(app)
      .put(`/api/requests/${requestId}/withdraw`)
      .set('Cookie', creatorCookie);
    expect(recipientWd.status).toBe(403);

    // Sender (brand) withdraws -> 200
    const senderWd = await request(app)
      .put(`/api/requests/${requestId}/withdraw`)
      .set('Cookie', brandCookie);
    expect(senderWd.status).toBe(200);
    expect(senderWd.body.data.status).toBe('withdrawn');

    // Withdrawing again returns 400
    const secondWd = await request(app)
      .put(`/api/requests/${requestId}/withdraw`)
      .set('Cookie', brandCookie);
    expect(secondWd.status).toBe(400);
  });

  it('inbox returns received requests and outbox returns sent requests', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_box@test.com');
    const { cookie: creatorCookie, user: creatorUser } = await registerUser('creator', 'creator_box@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    // Brand sends request to creator
    await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
      });

    // Creator's inbox has 1 item
    const creatorInbox = await request(app)
      .get('/api/requests?type=inbox')
      .set('Cookie', creatorCookie);
    expect(creatorInbox.status).toBe(200);
    expect(creatorInbox.body.data.length).toBe(1);

    // Creator's outbox has 0 items
    const creatorOutbox = await request(app)
      .get('/api/requests?type=outbox')
      .set('Cookie', creatorCookie);
    expect(creatorOutbox.status).toBe(200);
    expect(creatorOutbox.body.data.length).toBe(0);

    // Brand's outbox has 1 item
    const brandOutbox = await request(app)
      .get('/api/requests?type=outbox')
      .set('Cookie', brandCookie);
    expect(brandOutbox.status).toBe(200);
    expect(brandOutbox.body.data.length).toBe(1);
  });

  it('non-participant cannot view request details (403)', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand_part@test.com');
    const { user: creatorUser } = await registerUser('creator', 'creator_part@test.com');
    const { cookie: outsiderCookie } = await registerUser('creator', 'creator_outsider@test.com');

    const campaign = await createTestCampaign(brandCookie, 'open');

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brandCookie)
      .send({
        campaignId: campaign._id,
        recipientId: creatorUser._id,
      });
    const requestId = reqRes.body.data._id;

    // Outsider requests details -> 403
    const resOutsider = await request(app)
      .get(`/api/requests/${requestId}`)
      .set('Cookie', outsiderCookie);
    expect(resOutsider.status).toBe(403);
  });
});
