import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { User, CreatorProfile, BrandProfile, PortfolioItem } from '../models';

describe('Phase 2 - Profiles, Portfolios & Discovery Suite', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_vitest_profiles_suite_12345';
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
    await PortfolioItem.deleteMany({});
  });

  // Helper to register and get cookie
  const registerUser = async (role: 'creator' | 'brand' | 'freelancer' | 'talentManager', email: string, name = 'Test User') => {
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

  it('unauthenticated gets 401 on protected profile and portfolio routes', async () => {
    const resProfile = await request(app).get('/api/profile/me');
    expect(resProfile.status).toBe(401);

    const resPut = await request(app).put('/api/profile/me').send({ displayName: 'Hacker' });
    expect(resPut.status).toBe(401);

    const resPortfolio = await request(app).post('/api/portfolio').send({ title: 'Test' });
    expect(resPortfolio.status).toBe(401);
  });

  it('creator can create/update own profile', async () => {
    const { cookie } = await registerUser('creator', 'creator1@test.com', 'Alex Rivers');

    const updateRes = await request(app)
      .put('/api/profile/me')
      .set('Cookie', cookie)
      .send({
        displayName: 'Alex Rivers Creates',
        bio: 'Tech enthusiast and educator.',
        niche: 'Technology',
        platforms: [
          {
            platform: 'youtube',
            handle: '@alexrivers',
            url: 'https://youtube.com/@alexrivers',
            followers: 50000,
            engagementRate: 5.2,
          },
        ],
        location: 'New York, NY',
        languages: ['English'],
        contentTypes: ['Long-form', 'Shorts'],
        isPublic: true,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.profile.displayName).toBe('Alex Rivers Creates');
    expect(updateRes.body.profile.totalFollowers).toBe(50000);

    // Verify GET /api/profile/me
    const getRes = await request(app)
      .get('/api/profile/me')
      .set('Cookie', cookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.profile.displayName).toBe('Alex Rivers Creates');
    expect(getRes.body.profile.niche).toBe('Technology');
  });

  it('brand cannot edit a creator profile', async () => {
    const { cookie: brandCookie } = await registerUser('brand', 'brand1@test.com', 'Acme Corp');

    // Attempting to send creator profile fields as a brand fails brand validation
    const invalidRes = await request(app)
      .put('/api/profile/me')
      .set('Cookie', brandCookie)
      .send({
        displayName: 'Brand Trying Creator',
        niche: 'Gaming',
        platforms: [],
      });

    // Fails validation because BrandProfile requires companyName and industry
    expect(invalidRes.status).toBe(400);

    // Valid brand update works for BrandProfile
    const validBrandRes = await request(app)
      .put('/api/profile/me')
      .set('Cookie', brandCookie)
      .send({
        companyName: 'Acme Corp',
        industry: 'Retail',
        website: 'https://acme.example.com',
        about: 'Leading provider of widgets.',
      });

    expect(validBrandRes.status).toBe(200);
    expect(validBrandRes.body.profile.companyName).toBe('Acme Corp');

    // Confirm no CreatorProfile was created or touched
    const creatorProfilesCount = await CreatorProfile.countDocuments({});
    expect(creatorProfilesCount).toBe(0);
  });

  it('discovery filters by niche and follower range', async () => {
    // Creator A: Tech, 100k
    const { cookie: cA } = await registerUser('creator', 'cA@test.com', 'A');
    await request(app)
      .put('/api/profile/me')
      .set('Cookie', cA)
      .send({
        displayName: 'Tech Leader',
        niche: 'Technology',
        platforms: [{ platform: 'youtube', handle: '@techlead', url: 'https://youtube.com/@techlead', followers: 100000 }],
        isPublic: true,
      });

    // Creator B: Gaming, 50k
    const { cookie: cB } = await registerUser('creator', 'cB@test.com', 'B');
    await request(app)
      .put('/api/profile/me')
      .set('Cookie', cB)
      .send({
        displayName: 'Gamer Pro',
        niche: 'Gaming',
        platforms: [{ platform: 'twitch', handle: '@gamerpro', url: 'https://twitch.tv/gamerpro', followers: 50000 }],
        isPublic: true,
      });

    // Creator C: Tech, 5k
    const { cookie: cC } = await registerUser('creator', 'cC@test.com', 'C');
    await request(app)
      .put('/api/profile/me')
      .set('Cookie', cC)
      .send({
        displayName: 'Tech Rookie',
        niche: 'Technology',
        platforms: [{ platform: 'youtube', handle: '@rookie', url: 'https://youtube.com/@rookie', followers: 5000 }],
        isPublic: true,
      });

    // Filter by niche: Technology -> returns A and C
    const techRes = await request(app).get('/api/creators?niche=Technology');
    expect(techRes.status).toBe(200);
    expect(techRes.body.data.length).toBe(2);
    const names = techRes.body.data.map((c: any) => c.displayName);
    expect(names).toContain('Tech Leader');
    expect(names).toContain('Tech Rookie');

    // Filter by minFollowers: 20000 -> returns A (100k) and B (50k)
    const followersRes = await request(app).get('/api/creators?minFollowers=20000');
    expect(followersRes.status).toBe(200);
    expect(followersRes.body.data.length).toBe(2);
    const fNames = followersRes.body.data.map((c: any) => c.displayName);
    expect(fNames).toContain('Tech Leader');
    expect(fNames).toContain('Gamer Pro');

    // Combined niche and follower bounds: Technology and minFollowers 50000 -> only A
    const combinedRes = await request(app).get('/api/creators?niche=Technology&minFollowers=50000');
    expect(combinedRes.status).toBe(200);
    expect(combinedRes.body.data.length).toBe(1);
    expect(combinedRes.body.data[0].displayName).toBe('Tech Leader');
  });

  it('pagination works as expected', async () => {
    // Create 5 creators
    for (let i = 1; i <= 5; i++) {
      const { cookie } = await registerUser('creator', `page_creator_${i}@test.com`, `Creator ${i}`);
      await request(app)
        .put('/api/profile/me')
        .set('Cookie', cookie)
        .send({
          displayName: `Creator ${i}`,
          niche: 'Design',
          platforms: [{ platform: 'youtube', handle: `@c${i}`, url: `https://youtube.com/@c${i}`, followers: i * 1000 }],
          isPublic: true,
        });
    }

    // Page 1, limit 2
    const p1 = await request(app).get('/api/creators?limit=2&page=1');
    expect(p1.status).toBe(200);
    expect(p1.body.data.length).toBe(2);
    expect(p1.body.pagination.total).toBe(5);
    expect(p1.body.pagination.pages).toBe(3);
    expect(p1.body.pagination.page).toBe(1);

    // Page 2, limit 2
    const p2 = await request(app).get('/api/creators?limit=2&page=2');
    expect(p2.status).toBe(200);
    expect(p2.body.data.length).toBe(2);
    expect(p2.body.pagination.page).toBe(2);

    // Page 3, limit 2 -> remaining 1 item
    const p3 = await request(app).get('/api/creators?limit=2&page=3');
    expect(p3.status).toBe(200);
    expect(p3.body.data.length).toBe(1);
  });

  it('private profiles are hidden from discovery and from /:id for other users', async () => {
    const { cookie: ownerCookie, user: owner } = await registerUser('creator', 'private@test.com', 'Private Star');
    const updateRes = await request(app)
      .put('/api/profile/me')
      .set('Cookie', ownerCookie)
      .send({
        displayName: 'Private Star',
        niche: 'Cinema',
        platforms: [],
        isPublic: false,
      });

    const profileId = updateRes.body.profile._id;

    // Discovery should not list private profile
    const listRes = await request(app).get('/api/creators');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(0);

    // Another user or guest requesting /:id gets 404
    const guestRes = await request(app).get(`/api/creators/${profileId}`);
    expect(guestRes.status).toBe(404);

    const { cookie: otherCookie } = await registerUser('brand', 'other@test.com');
    const otherRes = await request(app).get(`/api/creators/${profileId}`).set('Cookie', otherCookie);
    expect(otherRes.status).toBe(404);

    // Owner requesting own profile via /:id gets 200
    const ownerRes = await request(app).get(`/api/creators/${profileId}`).set('Cookie', ownerCookie);
    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.creator.displayName).toBe('Private Star');
  });

  it('portfolio item cannot be edited or deleted by a non-owner', async () => {
    const { cookie: creatorA } = await registerUser('creator', 'portA@test.com');
    const { cookie: creatorB } = await registerUser('creator', 'portB@test.com');

    // Creator A creates portfolio item
    const createRes = await request(app)
      .post('/api/portfolio')
      .set('Cookie', creatorA)
      .send({
        title: 'Video Showcase 2026',
        description: 'Commercial video reel',
        type: 'video',
        url: 'https://youtube.com/watch?v=12345',
      });

    expect(createRes.status).toBe(201);
    const itemId = createRes.body.data._id;

    // Creator B attempts to edit -> 403 Forbidden
    const editResB = await request(app)
      .put(`/api/portfolio/${itemId}`)
      .set('Cookie', creatorB)
      .send({
        title: 'Hacked Title',
      });
    expect(editResB.status).toBe(403);

    // Creator B attempts to delete -> 403 Forbidden
    const delResB = await request(app)
      .delete(`/api/portfolio/${itemId}`)
      .set('Cookie', creatorB);
    expect(delResB.status).toBe(403);

    // Creator A can update successfully
    const editResA = await request(app)
      .put(`/api/portfolio/${itemId}`)
      .set('Cookie', creatorA)
      .send({
        title: 'Updated Video Showcase',
      });
    expect(editResA.status).toBe(200);
    expect(editResA.body.data.title).toBe('Updated Video Showcase');

    // Creator A can delete successfully
    const delResA = await request(app)
      .delete(`/api/portfolio/${itemId}`)
      .set('Cookie', creatorA);
    expect(delResA.status).toBe(200);

    // Item is now gone
    const verifyDel = await PortfolioItem.findById(itemId);
    expect(verifyDel).toBeNull();
  });

  it('invalid URL is rejected with 400', async () => {
    const { cookie } = await registerUser('creator', 'url_test@test.com');

    // ftp URL rejected in portfolio
    const ftpRes = await request(app)
      .post('/api/portfolio')
      .set('Cookie', cookie)
      .send({
        title: 'FTP File',
        type: 'link',
        url: 'ftp://files.example.com/asset.zip',
      });
    expect(ftpRes.status).toBe(400);

    // javascript: URL rejected in profile platform
    const jsRes = await request(app)
      .put('/api/profile/me')
      .set('Cookie', cookie)
      .send({
        displayName: 'JS Injector',
        niche: 'Tech',
        platforms: [
          {
            platform: 'youtube',
            handle: '@test',
            url: 'javascript:alert(1)',
          },
        ],
      });
    expect(jsRes.status).toBe(400);
  });

  it('response never contains email or passwordHash in public endpoints', async () => {
    const { cookie } = await registerUser('creator', 'sensitive_creator@test.com', 'Sensitive User');
    const updateRes = await request(app)
      .put('/api/profile/me')
      .set('Cookie', cookie)
      .send({
        displayName: 'Sensitive User',
        niche: 'Finance',
        platforms: [{ platform: 'youtube', handle: '@sensitive', url: 'https://youtube.com/@sensitive', followers: 1000 }],
        isPublic: true,
      });

    const creatorId = updateRes.body.profile._id;

    // Check GET /api/creators
    const listRes = await request(app).get('/api/creators');
    expect(listRes.status).toBe(200);
    const rawListJson = JSON.stringify(listRes.body);
    expect(rawListJson).not.toContain('sensitive_creator@test.com');
    expect(rawListJson).not.toContain('passwordHash');

    // Check GET /api/creators/:id
    const detailRes = await request(app).get(`/api/creators/${creatorId}`);
    expect(detailRes.status).toBe(200);
    const rawDetailJson = JSON.stringify(detailRes.body);
    expect(rawDetailJson).not.toContain('sensitive_creator@test.com');
    expect(rawDetailJson).not.toContain('passwordHash');

    // Check Brand public endpoint
    const { cookie: brandCookie } = await registerUser('brand', 'brand_secret@test.com', 'Brand Secret');
    const bUpdate = await request(app)
      .put('/api/profile/me')
      .set('Cookie', brandCookie)
      .send({
        companyName: 'Secret Brand LLC',
        industry: 'Security',
        website: 'https://security.example.com',
        isPublic: true,
      });
    const brandId = bUpdate.body.profile._id;

    const brandList = await request(app).get('/api/brands');
    expect(brandList.status).toBe(200);
    expect(JSON.stringify(brandList.body)).not.toContain('brand_secret@test.com');
    expect(JSON.stringify(brandList.body)).not.toContain('passwordHash');

    const brandDetail = await request(app).get(`/api/brands/${brandId}`);
    expect(brandDetail.status).toBe(200);
    expect(JSON.stringify(brandDetail.body)).not.toContain('brand_secret@test.com');
    expect(JSON.stringify(brandDetail.body)).not.toContain('passwordHash');
  });
});

