import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import {
  User,
  Campaign,
  CollaborationRequest,
  Contract,
  CalendarPost,
  CollaborationAnalytics,
  Review,
  Notification,
} from '../models';

describe('Phase 8 - Calendar, Analytics & Reviews Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_phase8_suite_99887';
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
    await Contract.deleteMany({});
    await CalendarPost.deleteMany({});
    await CollaborationAnalytics.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
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

  const setupAcceptedCollaboration = async () => {
    const brand = await registerUser('brand', 'brand_p8@test.com', 'Brand Master');
    const creator = await registerUser('creator', 'creator_p8@test.com', 'Creator Elite');
    const outsider = await registerUser('creator', 'outsider_p8@test.com', 'Outsider Person');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brand.cookie)
      .send({
        title: 'Phase 8 Campaign',
        brief: 'Test campaign for calendar and reviews',
        audience: 'General tech',
        budget: 1800,
        currency: 'USD',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'open',
        deliverables: [{ type: 'YouTube Video', count: 1 }],
      });

    const campaignId = campRes.body.data._id;

    // Send collaboration request brand -> creator
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brand.cookie)
      .send({
        campaignId,
        recipientId: creator.user.id || creator.user._id,
        pitch: 'Let us collaborate on deliverables',
        proposedRate: 1800,
        currency: 'USD',
      });

    const colReq = reqRes.body.data;

    // Creator accepts request
    await request(app)
      .put(`/api/requests/${colReq._id}/respond`)
      .set('Cookie', creator.cookie)
      .send({ action: 'accept' });

    return { brand, creator, outsider, campaignId, collabId: colReq._id };
  };

  describe('Content Calendar Endpoints', () => {
    it('requires authentication for calendar routes', async () => {
      const getRes = await request(app).get('/api/calendar');
      expect(getRes.status).toBe(401);

      const postRes = await request(app).post('/api/calendar').send({
        title: 'Unauthenticated post',
        platform: 'instagram',
        scheduledDate: new Date().toISOString(),
      });
      expect(postRes.status).toBe(401);
    });

    it('allows a user to create, list, update, and delete calendar posts', async () => {
      const { creator } = await setupAcceptedCollaboration();

      // Create post
      const createRes = await request(app)
        .post('/api/calendar')
        .set('Cookie', creator.cookie)
        .send({
          title: 'YouTube Launch Video',
          description: 'Talking points about CreatorOS',
          platform: 'youtube',
          scheduledDate: new Date('2026-06-15T14:00:00Z').toISOString(),
          status: 'scheduled',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.title).toBe('YouTube Launch Video');
      const postId = createRes.body.data._id;

      // List posts for month
      const listRes = await request(app)
        .get('/api/calendar?month=6&year=2026')
        .set('Cookie', creator.cookie);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(1);
      expect(listRes.body.data[0]._id).toBe(postId);

      // Update post
      const updateRes = await request(app)
        .put(`/api/calendar/${postId}`)
        .set('Cookie', creator.cookie)
        .send({
          title: 'Updated Launch Video',
          status: 'published',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe('Updated Launch Video');
      expect(updateRes.body.data.status).toBe('published');

      // Delete post
      const deleteRes = await request(app)
        .delete(`/api/calendar/${postId}`)
        .set('Cookie', creator.cookie);

      expect(deleteRes.status).toBe(200);

      const verifyList = await request(app)
        .get('/api/calendar?month=6&year=2026')
        .set('Cookie', creator.cookie);
      expect(verifyList.body.data).toHaveLength(0);
    });

    it('prevents non-owner from updating or deleting a calendar post (403)', async () => {
      const { creator, outsider } = await setupAcceptedCollaboration();

      const createRes = await request(app)
        .post('/api/calendar')
        .set('Cookie', creator.cookie)
        .send({
          title: 'Creator Private Post',
          platform: 'tiktok',
          scheduledDate: new Date().toISOString(),
        });

      const postId = createRes.body.data._id;

      const outsiderUpdate = await request(app)
        .put(`/api/calendar/${postId}`)
        .set('Cookie', outsider.cookie)
        .send({ title: 'Hacked Title' });
      expect(outsiderUpdate.status).toBe(403);

      const outsiderDelete = await request(app)
        .delete(`/api/calendar/${postId}`)
        .set('Cookie', outsider.cookie);
      expect(outsiderDelete.status).toBe(403);
    });

    it('rejects unknown fields in body with 400 (.strict())', async () => {
      const { creator } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/calendar')
        .set('Cookie', creator.cookie)
        .send({
          title: 'Test Strict',
          platform: 'instagram',
          scheduledDate: new Date().toISOString(),
          unknownField: true,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Campaign Analytics Endpoints', () => {
    it('allows collaboration participants to record and fetch self-reported metrics', async () => {
      const { creator, brand, collabId } = await setupAcceptedCollaboration();

      // Upsert metrics
      const upsertRes = await request(app)
        .post('/api/analytics')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          views: 32000,
          reach: 25000,
          clicks: 720,
          engagement: 1850,
          notes: 'Great organic reach spike on day 2',
        });

      expect(upsertRes.status).toBe(200);
      expect(upsertRes.body.success).toBe(true);
      expect(upsertRes.body.data.views).toBe(32000);

      // Brand views collaboration analytics
      const getRes = await request(app)
        .get(`/api/analytics/${collabId}`)
        .set('Cookie', brand.cookie);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.views).toBe(32000);
      expect(getRes.body.data.reach).toBe(25000);

      // Creator views summary
      const summaryRes = await request(app)
        .get('/api/analytics')
        .set('Cookie', creator.cookie);

      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.data.summary.totalViews).toBe(32000);
      expect(summaryRes.body.data.summary.totalClicks).toBe(720);
    });

    it('rejects non-participant from recording or viewing metrics (403)', async () => {
      const { outsider, collabId } = await setupAcceptedCollaboration();

      const upsertRes = await request(app)
        .post('/api/analytics')
        .set('Cookie', outsider.cookie)
        .send({
          collaborationId: collabId,
          views: 100,
          reach: 100,
          clicks: 10,
          engagement: 5,
        });
      expect(upsertRes.status).toBe(403);

      const getRes = await request(app)
        .get(`/api/analytics/${collabId}`)
        .set('Cookie', outsider.cookie);
      expect(getRes.status).toBe(403);
    });

    it('rejects negative metrics with 400', async () => {
      const { creator, collabId } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/analytics')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          views: -100,
          reach: 50,
          clicks: 10,
          engagement: 5,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Reviews and Ratings Endpoints', () => {
    it('allows participants to submit a mutual review and calculates average rating', async () => {
      const { brand, creator, collabId } = await setupAcceptedCollaboration();

      // Brand reviews creator
      const reviewRes = await request(app)
        .post('/api/reviews')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          rating: 5,
          comment: 'Outstanding video quality and quick turnaround!',
        });

      expect(reviewRes.status).toBe(201);
      expect(reviewRes.body.success).toBe(true);
      expect(reviewRes.body.data.rating).toBe(5);

      // Creator receives notification
      const notifRes = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);

      const reviewNotif = notifRes.body.data.find(
        (n: any) => n.title === 'New Review Received'
      );
      expect(reviewNotif).toBeDefined();

      // Check public reviews for creator
      const creatorId = creator.user.id || creator.user._id;
      const getReviewRes = await request(app).get(`/api/reviews/user/${creatorId}`);

      expect(getReviewRes.status).toBe(200);
      expect(getReviewRes.body.data.totalReviews).toBe(1);
      expect(getReviewRes.body.data.averageRating).toBe(5);
    });

    it('rejects duplicate review from the same party on the same collaboration (400)', async () => {
      const { brand, collabId } = await setupAcceptedCollaboration();

      // First review
      await request(app)
        .post('/api/reviews')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          rating: 4,
          comment: 'Good collaboration experience.',
        });

      // Second review attempts
      const dupRes = await request(app)
        .post('/api/reviews')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          rating: 5,
          comment: 'Trying to review again.',
        });

      expect(dupRes.status).toBe(400);
    });

    it('rejects ratings out of bounds (<1 or >5) with 400', async () => {
      const { creator, collabId } = await setupAcceptedCollaboration();

      const invalidRating = await request(app)
        .post('/api/reviews')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          rating: 6, // Exceeds 5
          comment: 'Invalid rating test',
        });

      expect(invalidRating.status).toBe(400);
    });

    it('rejects outsider from submitting a review for a collaboration (403)', async () => {
      const { outsider, collabId } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/reviews')
        .set('Cookie', outsider.cookie)
        .send({
          collaborationId: collabId,
          rating: 5,
          comment: 'Fake review from third party',
        });

      expect(res.status).toBe(403);
    });
  });
});
