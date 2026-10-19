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
  Invoice,
  Notification,
} from '../models';

describe('Phase 7 - Invoices and Payment Tracking Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_phase7_suite_11223';
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
    await Invoice.deleteMany({});
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
    const brand = await registerUser('brand', 'brand_inv@test.com', 'Brand Corp');
    const creator = await registerUser('creator', 'creator_inv@test.com', 'Creative Pro');
    const outsider = await registerUser('creator', 'outsider_inv@test.com', 'Random Person');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brand.cookie)
      .send({
        title: 'Spring Billing Campaign',
        brief: 'Test campaign for invoices',
        audience: 'General tech',
        budget: 2000,
        currency: 'USD',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'open',
        deliverables: [{ type: 'Reel', count: 2 }],
      });

    const campaignId = campRes.body.data._id;

    // Send collaboration request brand -> creator
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brand.cookie)
      .send({
        campaignId,
        recipientId: creator.user.id || creator.user._id,
        pitch: 'Let us collaborate on billing deliverables',
        proposedRate: 2000,
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

  describe('Invoice Creation', () => {
    it('requires authentication for POST /api/invoices', async () => {
      const res = await request(app).post('/api/invoices').send({
        collaborationId: new mongoose.Types.ObjectId().toString(),
        amount: 500,
        currency: 'USD',
        description: 'First milestone',
        dueDate: new Date().toISOString(),
      });
      expect(res.status).toBe(401);
    });

    it('allows collaboration participant (creator) to create draft invoice', async () => {
      const { creator, collabId } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          amount: 1000,
          currency: 'USD',
          description: 'Milestone 1 Deliverables',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          notes: 'Bank transfer preferred',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(1000);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}-\d{4}$/);
    });

    it('rejects non-participant from creating invoice for collaboration (403)', async () => {
      const { outsider, collabId } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', outsider.cookie)
        .send({
          collaborationId: collabId,
          amount: 500,
          currency: 'USD',
          description: 'Unauthorized invoice',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        });

      expect(res.status).toBe(403);
    });

    it('rejects unknown fields in request body with 400 (.strict())', async () => {
      const { creator, collabId } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          amount: 1000,
          currency: 'USD',
          description: 'Strict test',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          hackedStatus: 'paid', // Unknown field
        });

      expect(res.status).toBe(400);
    });

    it('rejects invalid or non-positive amount with 400', async () => {
      const { creator, collabId } = await setupAcceptedCollaboration();

      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          amount: -50,
          currency: 'USD',
          description: 'Negative amount',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Invoice Retrieval & Filtering', () => {
    it('rejects operator-injection in GET /api/invoices query params with 400', async () => {
      const { creator } = await setupAcceptedCollaboration();

      const res = await request(app)
        .get('/api/invoices?status[$ne]=paid')
        .set('Cookie', creator.cookie);

      expect(res.status).toBe(400);
    });

    it('allows issuer and client to view their invoices and isolates from outsiders', async () => {
      const { creator, brand, outsider, collabId } =
        await setupAcceptedCollaboration();

      // Creator creates invoice
      const createRes = await request(app)
        .post('/api/invoices')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          amount: 1500,
          currency: 'USD',
          description: 'Full campaign fee',
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        });

      const invoiceId = createRes.body.data._id;

      // Creator lists invoices
      const creatorList = await request(app)
        .get('/api/invoices')
        .set('Cookie', creator.cookie);
      expect(creatorList.status).toBe(200);
      expect(creatorList.body.data).toHaveLength(1);

      // Brand lists invoices
      const brandList = await request(app)
        .get('/api/invoices')
        .set('Cookie', brand.cookie);
      expect(brandList.status).toBe(200);
      expect(brandList.body.data).toHaveLength(1);

      // Outsider lists invoices -> sees 0
      const outsiderList = await request(app)
        .get('/api/invoices')
        .set('Cookie', outsider.cookie);
      expect(outsiderList.status).toBe(200);
      expect(outsiderList.body.data).toHaveLength(0);

      // Outsider accesses invoice by ID -> gets 403
      const outsiderGet = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set('Cookie', outsider.cookie);
      expect(outsiderGet.status).toBe(403);

      // Brand accesses invoice by ID -> gets 200
      const brandGet = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set('Cookie', brand.cookie);
      expect(brandGet.status).toBe(200);
      expect(brandGet.body.data.amount).toBe(1500);
    });
  });

  describe('Invoice Status Transitions', () => {
    it('allows issuer to transition status from draft -> sent -> paid, sending notifications', async () => {
      const { creator, brand, collabId } = await setupAcceptedCollaboration();

      const createRes = await request(app)
        .post('/api/invoices')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          amount: 800,
          currency: 'USD',
          description: 'Phase 1 Payment',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        });

      const invoiceId = createRes.body.data._id;

      // Transition draft -> sent
      const sendRes = await request(app)
        .put(`/api/invoices/${invoiceId}/status`)
        .set('Cookie', creator.cookie)
        .send({ status: 'sent' });

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.data.status).toBe('sent');

      // Brand receives notification
      const notifRes1 = await request(app)
        .get('/api/notifications')
        .set('Cookie', brand.cookie);

      const sentNotif = notifRes1.body.data.find(
        (n: any) => n.type === 'invoice_status' && n.title === 'New Invoice Received'
      );
      expect(sentNotif).toBeDefined();

      // Transition sent -> paid
      const payRes = await request(app)
        .put(`/api/invoices/${invoiceId}/status`)
        .set('Cookie', creator.cookie)
        .send({ status: 'paid' });

      expect(payRes.status).toBe(200);
      expect(payRes.body.data.status).toBe('paid');
      expect(payRes.body.data.paidAt).toBeDefined();

      // Brand receives marked-paid notification
      const notifRes2 = await request(app)
        .get('/api/notifications')
        .set('Cookie', brand.cookie);

      const paidNotif = notifRes2.body.data.find(
        (n: any) => n.type === 'invoice_status' && n.title === 'Invoice Marked Paid'
      );
      expect(paidNotif).toBeDefined();

      // Already paid invoice cannot change status
      const retryRes = await request(app)
        .put(`/api/invoices/${invoiceId}/status`)
        .set('Cookie', creator.cookie)
        .send({ status: 'sent' });

      expect(retryRes.status).toBe(400);
    });

    it('prevents non-issuer from changing invoice status (403)', async () => {
      const { creator, brand, collabId } = await setupAcceptedCollaboration();

      const createRes = await request(app)
        .post('/api/invoices')
        .set('Cookie', creator.cookie)
        .send({
          collaborationId: collabId,
          amount: 600,
          currency: 'USD',
          description: 'Testing unauthorized transition',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        });

      const invoiceId = createRes.body.data._id;

      // Brand attempts to mark as paid directly -> 403
      const brandUpdate = await request(app)
        .put(`/api/invoices/${invoiceId}/status`)
        .set('Cookie', brand.cookie)
        .send({ status: 'paid' });

      expect(brandUpdate.status).toBe(403);
    });
  });
});
