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
  Notification,
  Message,
} from '../models';

describe('Phase 6 - Notifications and Messaging Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_phase6_suite_98765';
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
    await Notification.deleteMany({});
    await Message.deleteMany({});
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

  const setupCollaboration = async () => {
    const brand = await registerUser('brand', 'brand_msg@test.com', 'Brand Corp');
    const creator = await registerUser('creator', 'creator_msg@test.com', 'Creator Studio');
    const outsider = await registerUser('creator', 'outsider_msg@test.com', 'Outsider User');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brand.cookie)
      .send({
        title: 'Messaging Campaign',
        brief: 'Test campaign for messaging',
        audience: 'General audience',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        budget: 1500,
        currency: 'USD',
        status: 'open',
        deliverables: [{ type: 'Reel', count: 1 }],
      });

    const campaignId = campRes.body.data._id;

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brand.cookie)
      .send({
        campaignId,
        recipientId: creator.user.id || creator.user._id,
        pitch: 'Would love to work with you on this campaign!',
        proposedRate: 1500,
        currency: 'USD',
      });

    const collabId = reqRes.body.data._id;

    return { brand, creator, outsider, campaignId, collabId };
  };

  describe('Notifications Endpoints', () => {
    it('requires authentication for GET /api/notifications', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });

    it('creates notification for recipient when collaboration request is sent', async () => {
      const { creator, brand } = await setupCollaboration();

      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.unreadCount).toBe(1);
      expect(res.body.data[0].type).toBe('request_received');
      expect(res.body.data[0].title).toBe('New Collaboration Request');
    });

    it('marks a specific notification as read', async () => {
      const { creator } = await setupCollaboration();

      const notifRes = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);
      const notifId = notifRes.body.data[0]._id;

      const markRes = await request(app)
        .put(`/api/notifications/${notifId}/read`)
        .set('Cookie', creator.cookie);

      expect(markRes.status).toBe(200);
      expect(markRes.body.success).toBe(true);
      expect(markRes.body.data.read).toBe(true);

      const checkRes = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);
      expect(checkRes.body.unreadCount).toBe(0);
    });

    it('returns 404 when marking non-existent or other user notification', async () => {
      const { outsider } = await setupCollaboration();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Cookie', outsider.cookie);

      expect(res.status).toBe(404);
    });

    it('marks all notifications as read for current user', async () => {
      const { creator } = await setupCollaboration();

      // Create a second notification directly
      await Notification.create({
        recipient: creator.user.id || creator.user._id,
        type: 'general',
        title: 'Platform update',
        message: 'Welcome to CreatorOS AI',
      });

      const beforeRes = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);
      expect(beforeRes.body.unreadCount).toBe(2);

      const markAllRes = await request(app)
        .put('/api/notifications/mark-all-read')
        .set('Cookie', creator.cookie);

      expect(markAllRes.status).toBe(200);
      expect(markAllRes.body.success).toBe(true);

      const afterRes = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);
      expect(afterRes.body.unreadCount).toBe(0);
    });
  });

  describe('Messaging Endpoints', () => {
    it('requires authentication for messaging routes', async () => {
      const res = await request(app).get('/api/messages');
      expect(res.status).toBe(401);

      const postRes = await request(app).post('/api/messages').send({
        collaborationId: new mongoose.Types.ObjectId().toString(),
        content: 'Hello',
      });
      expect(postRes.status).toBe(401);
    });

    it('rejects operator injection in GET /api/messages query params', async () => {
      const { brand } = await setupCollaboration();
      const res = await request(app)
        .get('/api/messages?collaborationId[$ne]=test')
        .set('Cookie', brand.cookie);

      expect(res.status).toBe(400);
    });

    it('allows collaboration participants to exchange messages', async () => {
      const { brand, creator, collabId } = await setupCollaboration();

      // Brand sends message to creator
      const sendRes1 = await request(app)
        .post('/api/messages')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          content: 'Hello! Excited to discuss details on this campaign.',
        });

      expect(sendRes1.status).toBe(201);
      expect(sendRes1.body.success).toBe(true);
      expect(sendRes1.body.data.content).toBe('Hello! Excited to discuss details on this campaign.');

      // Creator sends response
      const sendRes2 = await request(app)
        .post('/api/messages')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          content: 'Thanks for reaching out! Happy to align on deliverables.',
        });

      expect(sendRes2.status).toBe(201);
      expect(sendRes2.body.data.content).toBe('Thanks for reaching out! Happy to align on deliverables.');

      // Brand fetches messages
      const getRes = await request(app)
        .get(`/api/messages?collaborationId=${collabId}`)
        .set('Cookie', brand.cookie);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data).toHaveLength(2);
    });

    it('forbids outsider from reading or posting messages in the collaboration', async () => {
      const { outsider, collabId } = await setupCollaboration();

      const postRes = await request(app)
        .post('/api/messages')
        .set('Cookie', outsider.cookie)
        .send({
          collaborationId: collabId,
          content: 'I want to intercept this conversation',
        });

      expect(postRes.status).toBe(403);

      const getRes = await request(app)
        .get(`/api/messages?collaborationId=${collabId}`)
        .set('Cookie', outsider.cookie);

      expect(getRes.status).toBe(403);
    });

    it('validates message content length (rejects empty and >1000 characters)', async () => {
      const { brand, collabId } = await setupCollaboration();

      // Empty message
      const emptyRes = await request(app)
        .post('/api/messages')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          content: '   ',
        });
      expect(emptyRes.status).toBe(400);

      // Over 1000 characters
      const longMessage = 'A'.repeat(1001);
      const longRes = await request(app)
        .post('/api/messages')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          content: longMessage,
        });
      expect(longRes.status).toBe(400);
    });

    it('triggers a notification for counterparty when a message is sent', async () => {
      const { brand, creator, collabId } = await setupCollaboration();

      await request(app)
        .post('/api/messages')
        .set('Cookie', brand.cookie)
        .send({
          collaborationId: collabId,
          content: 'Check the new deliverables schedule please.',
        });

      const notifRes = await request(app)
        .get('/api/notifications')
        .set('Cookie', creator.cookie);

      const messageNotif = notifRes.body.data.find(
        (n: any) => n.type === 'new_message'
      );
      expect(messageNotif).toBeDefined();
      expect(messageNotif.title).toBe('New Collaboration Message');
    });

    it('returns conversations list with unread counts for participants', async () => {
      const { brand, creator, collabId } = await setupCollaboration();

      // Creator sends message
      await request(app)
        .post('/api/messages')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          content: 'Here is my update.',
        });

      // Brand checks conversations
      const convRes = await request(app)
        .get('/api/messages/conversations')
        .set('Cookie', brand.cookie);

      expect(convRes.status).toBe(200);
      expect(convRes.body.success).toBe(true);
      expect(convRes.body.data).toHaveLength(1);
      expect(convRes.body.data[0].unreadCount).toBe(1);
      expect(convRes.body.data[0].lastMessage.content).toBe('Here is my update.');

      // When brand fetches messages, unread count resets
      await request(app)
        .get(`/api/messages?collaborationId=${collabId}`)
        .set('Cookie', brand.cookie);

      const convResAfter = await request(app)
        .get('/api/messages/conversations')
        .set('Cookie', brand.cookie);

      expect(convResAfter.body.data[0].unreadCount).toBe(0);
    });
  });
});
