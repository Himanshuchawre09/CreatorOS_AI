import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { User, Campaign, CollaborationRequest, Contract } from '../models';

describe('Phase 3 - Contracts Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_contracts_suite_12345';
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
    const brand = await registerUser('brand', 'brand@test.com', 'TechBrand');
    const creator = await registerUser('creator', 'creator@test.com', 'ReviewerPro');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brand.cookie)
      .send({
        title: 'Smartphone Unboxing',
        brief: 'Detailed unboxing and impression',
        audience: 'Gadget lovers',
        budget: 1500,
        currency: 'USD',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'open',
        deliverables: [
          { type: 'YouTube Video', count: 1, details: '10 min review' },
          { type: 'Instagram Reel', count: 2 },
        ],
      });

    const campaign = campRes.body.data;

    // Send collaboration request brand -> creator
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brand.cookie)
      .send({
        campaignId: campaign._id,
        recipientId: creator.user._id,
        pitch: 'We would love to collaborate on this campaign!',
        proposedRate: 1500,
        currency: 'USD',
      });

    const colReq = reqRes.body.data;

    // Creator accepts request
    await request(app)
      .put(`/api/requests/${colReq._id}/respond`)
      .set('Cookie', creator.cookie)
      .send({ action: 'accept' });

    return { brand, creator, campaign, colReq };
  };

  it('automatically creates a draft contract when a collaboration request is accepted', async () => {
    const { brand, creator, campaign, colReq } = await setupAcceptedCollaboration();

    const contract = await Contract.findOne({ collaborationRequest: colReq._id });
    expect(contract).toBeTruthy();
    expect(contract?.status).toBe('draft');
    expect(contract?.brand.toString()).toBe(brand.user._id);
    expect(contract?.creator.toString()).toBe(creator.user._id);
    expect(contract?.budget).toBe(1500);
    expect(contract?.deliverables.length).toBe(2);
    expect(contract?.brandSignedAt).toBeNull();
    expect(contract?.creatorSignedAt).toBeNull();
  });

  it('participants can view the contract details with 200', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    // Brand view
    const brandViewRes = await request(app)
      .get(`/api/contracts/${contract!._id}`)
      .set('Cookie', brand.cookie);

    expect(brandViewRes.status).toBe(200);
    expect(brandViewRes.body.success).toBe(true);
    expect(brandViewRes.body.data.campaign.title).toBe('Smartphone Unboxing');

    // Creator view
    const creatorViewRes = await request(app)
      .get(`/api/contracts/${contract!._id}`)
      .set('Cookie', creator.cookie);

    expect(creatorViewRes.status).toBe(200);
    expect(creatorViewRes.body.success).toBe(true);
  });

  it('non-participant cannot view contract details (403)', async () => {
    const { colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    const thirdParty = await registerUser('brand', 'otherbrand@test.com', 'Other');

    const res = await request(app)
      .get(`/api/contracts/${contract!._id}`)
      .set('Cookie', thirdParty.cookie);

    expect(res.status).toBe(403);
  });

  it('participant can update notes and terms while in draft', async () => {
    const { brand, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    const updateRes = await request(app)
      .put(`/api/contracts/${contract!._id}`)
      .set('Cookie', brand.cookie)
      .send({
        notes: 'Updated agreement notes: payment upon delivery.',
        budget: 1800,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.notes).toBe('Updated agreement notes: payment upon delivery.');
    expect(updateRes.body.data.budget).toBe(1800);
  });

  it('both parties sign: signing flow transitions status to signed when both have signed', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    // 1. Brand signs first
    const brandSignRes = await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', brand.cookie);

    expect(brandSignRes.status).toBe(200);
    expect(brandSignRes.body.data.brandSignedAt).toBeTruthy();
    expect(brandSignRes.body.data.creatorSignedAt).toBeNull();
    expect(brandSignRes.body.data.status).toBe('sent'); // Awaiting counter signature

    // 2. Creator counter-signs
    const creatorSignRes = await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', creator.cookie);

    expect(creatorSignRes.status).toBe(200);
    expect(creatorSignRes.body.data.creatorSignedAt).toBeTruthy();
    expect(creatorSignRes.body.data.status).toBe('signed'); // Fully signed & active!
  });

  it('user cannot sign twice (400)', async () => {
    const { brand, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', brand.cookie);

    const secondSignRes = await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', brand.cookie);

    expect(secondSignRes.status).toBe(400);
    expect(secondSignRes.body.message).toContain('already signed');
  });

  it('non-participant cannot sign a contract (403)', async () => {
    const { colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    const stranger = await registerUser('creator', 'stranger@test.com', 'Stranger');

    const res = await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', stranger.cookie);

    expect(res.status).toBe(403);
  });

  it('cannot edit contract once it is signed (400)', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    // Both sign
    await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', brand.cookie);
    await request(app)
      .put(`/api/contracts/${contract!._id}/sign`)
      .set('Cookie', creator.cookie);

    // Try to update signed contract
    const editRes = await request(app)
      .put(`/api/contracts/${contract!._id}`)
      .set('Cookie', brand.cookie)
      .send({ budget: 5000 });

    expect(editRes.status).toBe(400);
    expect(editRes.body.message).toContain('Cannot edit a contract that is already signed');
  });

  it('participant can decline contract with reason', async () => {
    const { creator, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    const declineRes = await request(app)
      .put(`/api/contracts/${contract!._id}/decline`)
      .set('Cookie', creator.cookie)
      .send({ reason: 'Timeline conflicts with another commitment' });

    expect(declineRes.status).toBe(200);
    expect(declineRes.body.data.status).toBe('declined');
    expect(declineRes.body.data.declineReason).toBe('Timeline conflicts with another commitment');
  });

  it('unknown body field is rejected with 400 (strict validation)', async () => {
    const { brand, colReq } = await setupAcceptedCollaboration();
    const contract = await Contract.findOne({ collaborationRequest: colReq._id });

    const res = await request(app)
      .put(`/api/contracts/${contract!._id}`)
      .set('Cookie', brand.cookie)
      .send({
        unknownField: 'malicious',
        budget: 2000,
      });

    expect(res.status).toBe(400);
  });

  it('operator-injection query parameter is rejected with 400', async () => {
    const { brand } = await setupAcceptedCollaboration();

    const res = await request(app)
      .get('/api/contracts?status[$ne]=signed')
      .set('Cookie', brand.cookie);

    expect(res.status).toBe(400);
  });
});
