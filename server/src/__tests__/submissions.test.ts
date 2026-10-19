import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { createApp } from '../app';
import { User, Campaign, CollaborationRequest, Contract, Submission } from '../models';

describe('Phase 5 - Content Submission & Approval Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  // Valid PNG signature buffer (8 bytes)
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);

  // Valid PDF signature buffer (%PDF)
  const validPdfBuffer = Buffer.from('%PDF-1.4\n%test pdf content');

  // Spoofed file (text pretending to be PNG)
  const invalidBuffer = Buffer.from('Plain text content that is not an image');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_submissions_suite_12345';
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
    await Submission.deleteMany({});
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
    const brand = await registerUser('brand', 'brand_sub@test.com', 'Brand Co');
    const creator = await registerUser('creator', 'creator_sub@test.com', 'Creator Co');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brand.cookie)
      .send({
        title: 'Spring Campaign 2026',
        brief: 'Content deliverables for review',
        audience: 'Fashion lifestyle',
        budget: 2000,
        currency: 'USD',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'open',
        deliverables: [{ type: 'Photo Post', count: 1 }],
      });

    const campaign = campRes.body.data;

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brand.cookie)
      .send({
        campaignId: campaign._id,
        recipientId: creator.user._id,
        pitch: 'Submit your photos!',
        proposedRate: 2000,
        currency: 'USD',
      });

    const colReq = reqRes.body.data;

    await request(app)
      .put(`/api/requests/${colReq._id}/respond`)
      .set('Cookie', creator.cookie)
      .send({ action: 'accept' });

    return { brand, creator, campaign, colReq };
  };

  it('creator can submit a deliverable with a valid PNG file signature', async () => {
    const { creator, colReq } = await setupAcceptedCollaboration();

    const res = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Final High-Res Image')
      .field('description', 'Initial draft for review')
      .attach('file', validPngBuffer, 'photo.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe(1);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.file.mimeType).toBe('image/png');
  });

  it('rejects upload with spoofed or invalid magic bytes (400)', async () => {
    const { creator, colReq } = await setupAcceptedCollaboration();

    const res = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Spoofed Deliverable')
      .attach('file', invalidBuffer, 'spoofed.png');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('File signature verification failed');
  });

  it('non-participant cannot submit a deliverable (403)', async () => {
    const { colReq } = await setupAcceptedCollaboration();
    const outsider = await registerUser('creator', 'outsider_sub@test.com', 'Outsider');

    const res = await request(app)
      .post('/api/submissions')
      .set('Cookie', outsider.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Intruder Deliverable')
      .attach('file', validPngBuffer, 'photo.png');

    expect(res.status).toBe(403);
  });

  it('brand can approve a submission (status becomes approved)', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    const subRes = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Deliverable 1')
      .attach('file', validPngBuffer, 'deliverable.png');

    const submissionId = subRes.body.data._id;

    const reviewRes = await request(app)
      .put(`/api/submissions/${submissionId}/review`)
      .set('Cookie', brand.cookie)
      .send({
        action: 'approve',
        comment: 'Looks amazing! Ready to publish.',
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.status).toBe('approved');
    expect(reviewRes.body.data.feedback).toBe('Looks amazing! Ready to publish.');
  });

  it('brand can request changes with feedback comment', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    const subRes = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Draft Video')
      .attach('file', validPdfBuffer, 'storyboard.pdf');

    const submissionId = subRes.body.data._id;

    const reviewRes = await request(app)
      .put(`/api/submissions/${submissionId}/review`)
      .set('Cookie', brand.cookie)
      .send({
        action: 'requestChanges',
        comment: 'Please adjust the brand logo placement at 0:15',
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.status).toBe('changesRequested');
    expect(reviewRes.body.data.feedback).toBe('Please adjust the brand logo placement at 0:15');
  });

  it('creator cannot approve their own submission (403)', async () => {
    const { creator, colReq } = await setupAcceptedCollaboration();

    const subRes = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Deliverable')
      .attach('file', validPngBuffer, 'photo.png');

    const submissionId = subRes.body.data._id;

    const reviewRes = await request(app)
      .put(`/api/submissions/${submissionId}/review`)
      .set('Cookie', creator.cookie)
      .send({ action: 'approve' });

    expect(reviewRes.status).toBe(403);
  });

  it('creator can upload revision, incrementing version to 2 and preserving revision history', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    // 1. Initial version
    const subRes = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Version 1')
      .attach('file', validPngBuffer, 'v1.png');

    const submissionId = subRes.body.data._id;

    // 2. Brand requests changes
    await request(app)
      .put(`/api/submissions/${submissionId}/review`)
      .set('Cookie', brand.cookie)
      .send({ action: 'requestChanges', comment: 'Darken the background' });

    // 3. Creator uploads v2 revision
    const revRes = await request(app)
      .post(`/api/submissions/${submissionId}/revision`)
      .set('Cookie', creator.cookie)
      .field('title', 'Version 2 with Darkened Background')
      .attach('file', validPngBuffer, 'v2.png');

    expect(revRes.status).toBe(200);
    expect(revRes.body.data.version).toBe(2);
    expect(revRes.body.data.status).toBe('pending');
    expect(revRes.body.data.revisions.length).toBe(1);
    expect(revRes.body.data.revisions[0].version).toBe(1);
    expect(revRes.body.data.revisions[0].feedback).toBe('Darken the background');
  });

  it('authorized download endpoint serves file to participants (200) and rejects non-participants (403)', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();
    const outsider = await registerUser('brand', 'outsider_dl@test.com', 'Outsider');

    const subRes = await request(app)
      .post('/api/submissions')
      .set('Cookie', creator.cookie)
      .field('collaborationId', colReq._id)
      .field('title', 'Download Test Deliverable')
      .attach('file', validPngBuffer, 'download_test.png');

    const submissionId = subRes.body.data._id;

    // Participant (Brand) downloads
    const brandDlRes = await request(app)
      .get(`/api/submissions/${submissionId}/file`)
      .set('Cookie', brand.cookie);

    expect(brandDlRes.status).toBe(200);

    // Non-participant downloads -> 403
    const outsiderDlRes = await request(app)
      .get(`/api/submissions/${submissionId}/file`)
      .set('Cookie', outsider.cookie);

    expect(outsiderDlRes.status).toBe(403);
  });

  it('operator-injection query parameter is rejected with 400', async () => {
    const { brand } = await setupAcceptedCollaboration();

    const res = await request(app)
      .get('/api/submissions?status[$ne]=approved')
      .set('Cookie', brand.cookie);

    expect(res.status).toBe(400);
  });
});
