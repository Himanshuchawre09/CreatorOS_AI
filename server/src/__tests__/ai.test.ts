import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { User, CreatorProfile, BrandProfile, Campaign } from '../models';
import { aiService, MockProvider, IAIProvider } from '../services/ai.service';

describe('Phase 9 - AI Features Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_ai_suite_12345';
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
    aiService.setProvider(new MockProvider());
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
    const cookie = res.headers['set-cookie'];
    return { user: res.body.user, cookie };
  };

  it('unauthenticated requests return 401 on all AI endpoints', async () => {
    const statusRes = await request(app).get('/api/ai/status');
    expect(statusRes.status).toBe(401);

    const recRes = await request(app).post('/api/ai/recommend').send({ target: 'creators' });
    expect(recRes.status).toBe(401);

    const priceRes = await request(app).post('/api/ai/price-estimate').send({ platform: 'youtube', contentType: 'video' });
    expect(priceRes.status).toBe(401);

    const emailRes = await request(app).post('/api/ai/email-draft').send({ recipientName: 'Alice', recipientType: 'creator', campaignGoal: 'Brand awareness' });
    expect(emailRes.status).toBe(401);

    const summaryRes = await request(app).post('/api/ai/analytics-summary').send({});
    expect(summaryRes.status).toBe(401);

    const planRes = await request(app).post('/api/ai/content-plan').send({ niche: 'tech', goal: 'growth' });
    expect(planRes.status).toBe(401);
  });

  it('GET /api/ai/status returns mock status when GEMINI_API_KEY is not configured', async () => {
    const { cookie } = await registerUser('brand', 'brand_status@test.com');
    const res = await request(app)
      .get('/api/ai/status')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isMock).toBe(true);
    expect(res.body.data.provider).toBe('mock');
  });

  it('POST /api/ai/recommend: returns empty list honestly when no matching candidates in DB', async () => {
    const { cookie } = await registerUser('brand', 'brand_rec1@test.com');
    const res = await request(app)
      .post('/api/ai/recommend')
      .set('Cookie', cookie)
      .send({ target: 'creators' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendations).toEqual([]);
    expect(res.body.data.message).toContain('No creators found in database');
    expect(res.body.data.isMock).toBe(true);
  });

  it('POST /api/ai/recommend: ranks and enriches real candidates from DB without hallucinations', async () => {
    const { user: creatorUser } = await registerUser('creator', 'creator_cand@test.com', 'Sarah Tech');
    await CreatorProfile.create({
      user: creatorUser._id || creatorUser.id,
      displayName: 'Sarah Tech Reviews',
      bio: 'In-depth gadget and tech reviews.',
      niche: 'Technology',
      platforms: [{ platform: 'youtube', handle: '@sarahtech', url: 'https://youtube.com/@sarahtech', followers: 50000 }],
      isPublic: true,
    });

    const { cookie: brandCookie } = await registerUser('brand', 'brand_rec2@test.com');
    const res = await request(app)
      .post('/api/ai/recommend')
      .set('Cookie', brandCookie)
      .send({
        target: 'creators',
        niche: 'Technology',
        goal: 'Promote new wireless headphones',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);

    const firstRec = res.body.data.recommendations[0];
    expect(firstRec.displayName).toBe('Sarah Tech Reviews');
    expect(firstRec.matchScore).toBeGreaterThan(0);
    expect(firstRec.reason).toBeDefined();
    expect(firstRec.pitchAngle).toBeDefined();
  });

  it('POST /api/ai/recommend rejects unknown body fields with 400 (strict schema)', async () => {
    const { cookie } = await registerUser('brand', 'brand_rec_strict@test.com');
    const res = await request(app)
      .post('/api/ai/recommend')
      .set('Cookie', cookie)
      .send({
        target: 'creators',
        unknownField: 'malicious',
      });

    expect(res.status).toBe(400);
  });

  it('POST /api/ai/price-estimate generates realistic range labeled as estimate', async () => {
    const { cookie } = await registerUser('creator', 'creator_price@test.com');
    const res = await request(app)
      .post('/api/ai/price-estimate')
      .set('Cookie', cookie)
      .send({
        platform: 'youtube',
        contentType: 'Dedicated Video',
        followers: 40000,
        engagementRate: 4.5,
        deliverablesSummary: '1 integrated 60-second video sponsor segment',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.minPrice).toBeGreaterThan(0);
    expect(res.body.data.maxPrice).toBeGreaterThan(res.body.data.minPrice);
    expect(res.body.data.disclaimer).toBe('estimate');
    expect(res.body.data.currency).toBe('USD');
    expect(typeof res.body.data.reasoning).toBe('string');
  });

  it('POST /api/ai/price-estimate rejects invalid platform or negative followers with 400', async () => {
    const { cookie } = await registerUser('creator', 'creator_price_inv@test.com');
    const res = await request(app)
      .post('/api/ai/price-estimate')
      .set('Cookie', cookie)
      .send({
        platform: 'invalid_platform',
        contentType: 'post',
        followers: -50,
      });

    expect(res.status).toBe(400);
  });

  it('POST /api/ai/email-draft generates editable subject and body', async () => {
    const { cookie } = await registerUser('brand', 'brand_draft@test.com');
    const res = await request(app)
      .post('/api/ai/email-draft')
      .set('Cookie', cookie)
      .send({
        recipientName: 'David Creator',
        recipientType: 'creator',
        campaignGoal: 'Launch Q4 Gaming Mouse',
        tone: 'professional',
        customNotes: 'Highlight 1ms response latency feature',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject).toContain('Partnership');
    expect(res.body.data.body).toContain('David Creator');
  });

  it('POST /api/ai/analytics-summary honestly returns hasData: false when metrics are empty', async () => {
    const { cookie } = await registerUser('creator', 'creator_analytic_empty@test.com');
    const res = await request(app)
      .post('/api/ai/analytics-summary')
      .set('Cookie', cookie)
      .send({
        metrics: { views: 0, clicks: 0, reach: 0 },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasData).toBe(false);
    expect(res.body.data.summary).toContain('No stored performance metrics available');
    expect(res.body.data.insights).toEqual([]);
  });

  it('POST /api/ai/analytics-summary summarizes stored metrics without inventing numbers', async () => {
    const { cookie } = await registerUser('brand', 'brand_analytic_full@test.com');
    const res = await request(app)
      .post('/api/ai/analytics-summary')
      .set('Cookie', cookie)
      .send({
        metrics: {
          views: 50000,
          reach: 80000,
          clicks: 2500,
        },
        campaignContext: 'Summer Tech Launch',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasData).toBe(true);
    expect(res.body.data.summary).toContain('50,000');
    expect(res.body.data.summary).toContain('2,500');
    expect(res.body.data.insights.length).toBeGreaterThan(0);
  });

  it('POST /api/ai/content-plan returns structured topics, hooks, and hashtags', async () => {
    const { cookie } = await registerUser('creator', 'creator_content_plan@test.com');
    const res = await request(app)
      .post('/api/ai/content-plan')
      .set('Cookie', cookie)
      .send({
        niche: 'Productivity & Time Management',
        goal: 'Grow newsletter subscribers',
        platform: 'instagram',
        timeframeWeeks: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ideas.length).toBeGreaterThan(0);
    const idea = res.body.data.ideas[0];
    expect(idea.title).toBeDefined();
    expect(idea.hook).toBeDefined();
    expect(idea.suggestedCaption).toBeDefined();
    expect(Array.isArray(idea.hashtags)).toBe(true);
  });

  it('returns 504 when AI request times out', async () => {
    const { cookie } = await registerUser('brand', 'timeout_user@test.com');

    // Create a mock provider that throws timeout
    const timeoutProvider: IAIProvider = {
      name: 'mock-timeout',
      isMock: true,
      generateText: async () => {
        throw new Error('AI request timed out after 10 seconds');
      },
    };
    aiService.setProvider(timeoutProvider);

    const res = await request(app)
      .post('/api/ai/content-plan')
      .set('Cookie', cookie)
      .send({
        niche: 'tech',
        goal: 'reach 100k views',
      });

    expect(res.status).toBe(504);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('timed out');
  });

  it('returns 502 when AI response is malformed', async () => {
    const { cookie } = await registerUser('brand', 'malformed_user@test.com');

    // Create a mock provider that returns invalid non-JSON string
    const malformedProvider: IAIProvider = {
      name: 'mock-malformed',
      isMock: true,
      generateText: async () => '<<<INVALID_NOT_JSON>>>',
    };
    aiService.setProvider(malformedProvider);

    const res = await request(app)
      .post('/api/ai/price-estimate')
      .set('Cookie', cookie)
      .send({
        platform: 'youtube',
        contentType: 'Dedicated Video',
        followers: 10000,
      });

    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Failed to parse AI response');
  });
});
