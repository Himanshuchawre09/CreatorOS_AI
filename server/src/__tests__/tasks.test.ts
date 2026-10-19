import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { User, Campaign, CollaborationRequest, Contract, Task } from '../models';

describe('Phase 4 - Tasks & Workspace Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_tasks_suite_12345';
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
    await Task.deleteMany({});
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
    const brand = await registerUser('brand', 'brand_task@test.com', 'Acme Brand');
    const creator = await registerUser('creator', 'creator_task@test.com', 'Video Master');

    const campRes = await request(app)
      .post('/api/campaigns')
      .set('Cookie', brand.cookie)
      .send({
        title: 'Product Launch 2026',
        brief: 'Deliverable workflow tasks',
        audience: 'General tech',
        budget: 1200,
        currency: 'USD',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'open',
        deliverables: [{ type: 'YouTube Video', count: 1 }],
      });

    const campaign = campRes.body.data;

    // Send collaboration request brand -> creator
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', brand.cookie)
      .send({
        campaignId: campaign._id,
        recipientId: creator.user._id,
        pitch: 'Collaborate with us!',
        proposedRate: 1200,
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

  it('participant can create a task for self or counterparty in collaboration', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Draft Script Outline',
        description: 'Prepare initial 3-point bullet outline for the video review',
        assigneeId: creator.user._id,
        status: 'todo',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Draft Script Outline');
    expect(res.body.data.assignee._id).toBe(creator.user._id);
    expect(res.body.data.status).toBe('todo');
  });

  it('non-participant cannot create a task in collaboration (403)', async () => {
    const { colReq } = await setupAcceptedCollaboration();
    const outsider = await registerUser('creator', 'outsider@test.com', 'Outsider');

    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', outsider.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Unauthorized Task',
        assigneeId: outsider.user._id,
      });

    expect(res.status).toBe(403);
  });

  it('cannot assign task to an outsider who is not part of the collaboration (400)', async () => {
    const { brand, colReq } = await setupAcceptedCollaboration();
    const outsider = await registerUser('creator', 'stranger_assignee@test.com', 'Stranger');

    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Assigned to stranger',
        assigneeId: outsider.user._id,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('participant');
  });

  it('participants can view tasks for the collaboration', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Task 1',
        assigneeId: creator.user._id,
        status: 'todo',
      });

    // Creator retrieves tasks
    const res = await request(app)
      .get(`/api/tasks?collaborationId=${colReq._id}`)
      .set('Cookie', creator.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Task 1');
  });

  it('non-participant cannot view tasks for the collaboration (403)', async () => {
    const { colReq } = await setupAcceptedCollaboration();
    const outsider = await registerUser('brand', 'outsider_view@test.com', 'Outsider View');

    const res = await request(app)
      .get(`/api/tasks?collaborationId=${colReq._id}`)
      .set('Cookie', outsider.cookie);

    expect(res.status).toBe(403);
  });

  it('participant can update task status and details', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Recording Rough Cut',
        assigneeId: creator.user._id,
        status: 'todo',
      });

    const taskId = createRes.body.data._id;

    // Move to 'doing'
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', creator.cookie)
      .send({
        status: 'doing',
        description: 'Currently shooting b-roll footage',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('doing');
    expect(updateRes.body.data.description).toBe('Currently shooting b-roll footage');
  });

  it('participant can delete task', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Temporary Task',
        assigneeId: creator.user._id,
      });

    const taskId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Cookie', brand.cookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const check = await Task.findById(taskId);
    expect(check).toBeNull();
  });

  it('non-participant cannot update or delete task (403)', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();
    const outsider = await registerUser('creator', 'intruder@test.com', 'Intruder');

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Protected Task',
        assigneeId: creator.user._id,
      });

    const taskId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', outsider.cookie)
      .send({ status: 'done' });

    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Cookie', outsider.cookie);

    expect(deleteRes.status).toBe(403);
  });

  it('unknown body field in task creation is rejected with 400', async () => {
    const { brand, creator, colReq } = await setupAcceptedCollaboration();

    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', brand.cookie)
      .send({
        collaborationId: colReq._id,
        title: 'Task with unknown field',
        assigneeId: creator.user._id,
        injectedField: 'malicious',
      });

    expect(res.status).toBe(400);
  });

  it('operator-injection query parameter is rejected with 400', async () => {
    const { brand } = await setupAcceptedCollaboration();

    const res = await request(app)
      .get('/api/tasks?status[$ne]=done')
      .set('Cookie', brand.cookie);

    expect(res.status).toBe(400);
  });
});
