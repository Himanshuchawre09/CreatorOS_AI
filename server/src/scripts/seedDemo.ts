import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User, CreatorProfile, BrandProfile, FreelancerProfile, PortfolioItem } from '../models';
import { logger } from '../utils/logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || process.env.ADMIN_PASSWORD || 'DemoSecret123!';

const seedDemo = async (): Promise<void> => {
  try {
    await connectDatabase();
    logger.info('Starting demo accounts seed (emails ending with @demo.creatoros.test)...');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    // 1. Tech Creator Demo
    let creator1 = await User.findOne({ email: 'tech.sarah@demo.creatoros.test' });
    if (!creator1) {
      creator1 = await User.create({
        name: 'Sarah Chen',
        email: 'tech.sarah@demo.creatoros.test',
        passwordHash,
        role: 'creator',
        status: 'active',
      });
    }
    await CreatorProfile.findOneAndUpdate(
      { user: creator1._id },
      {
        user: creator1._id,
        displayName: 'Sarah Chen Tech',
        bio: 'In-depth mechanical keyboard and developer desk setup reviews. Weekly hardware deep dives and desk lifestyle.',
        niche: 'Tech & Hardware',
        platforms: [
          {
            platform: 'youtube',
            handle: '@sarahchentech',
            url: 'https://youtube.com/@sarahchentech',
            followers: 245000,
            engagementRate: 4.8,
          },
          {
            platform: 'tiktok',
            handle: '@sarahchen_desk',
            url: 'https://tiktok.com/@sarahchen_desk',
            followers: 520000,
            engagementRate: 6.2,
          },
        ],
        location: 'San Francisco, CA',
        languages: ['English', 'Mandarin'],
        contentTypes: ['Long-form Review', 'Shorts', 'Product Unboxing'],
        rateNotes: 'Open to sponsored integration segments and dedicated hardware showcases.',
        isPublic: true,
        totalFollowers: 765000,
      },
      { upsert: true, new: true }
    );

    await PortfolioItem.findOneAndUpdate(
      { owner: creator1._id, title: 'Keychron Q1 Pro Ultimate Setup Review' },
      {
        owner: creator1._id,
        title: 'Keychron Q1 Pro Ultimate Setup Review',
        description: 'Comprehensive 12-minute review covering acoustic tests, wireless latency, and macro setups.',
        type: 'video',
        url: 'https://youtube.com/watch?v=demo-keychron',
      },
      { upsert: true }
    );

    // 2. Fitness & Health Creator Demo
    let creator2 = await User.findOne({ email: 'fitness.marcus@demo.creatoros.test' });
    if (!creator2) {
      creator2 = await User.create({
        name: 'Marcus Miller',
        email: 'fitness.marcus@demo.creatoros.test',
        passwordHash,
        role: 'creator',
        status: 'active',
      });
    }
    await CreatorProfile.findOneAndUpdate(
      { user: creator2._id },
      {
        user: creator2._id,
        displayName: 'Marcus Miller Fitness',
        bio: 'Calisthenics coach and nutrition researcher. Sharing science-based training routines and recovery protocols.',
        niche: 'Fitness & Wellness',
        platforms: [
          {
            platform: 'instagram',
            handle: '@marcus_mobility',
            url: 'https://instagram.com/marcus_mobility',
            followers: 185000,
            engagementRate: 5.1,
          },
          {
            platform: 'youtube',
            handle: '@marcusmillerfit',
            url: 'https://youtube.com/@marcusmillerfit',
            followers: 98000,
            engagementRate: 3.9,
          },
        ],
        location: 'Austin, TX',
        languages: ['English'],
        contentTypes: ['Workout Reels', 'Podcast Sponsorship', 'Program Guides'],
        rateNotes: 'Exclusively partners with tested, third-party verified nutrition and recovery gear.',
        isPublic: true,
        totalFollowers: 283000,
      },
      { upsert: true, new: true }
    );

    // 3. Gaming & Streaming Creator Demo
    let creator3 = await User.findOne({ email: 'gaming.luna@demo.creatoros.test' });
    if (!creator3) {
      creator3 = await User.create({
        name: 'Luna Zhao',
        email: 'gaming.luna@demo.creatoros.test',
        passwordHash,
        role: 'creator',
        status: 'active',
      });
    }
    await CreatorProfile.findOneAndUpdate(
      { user: creator3._id },
      {
        user: creator3._id,
        displayName: 'LunaByte Gaming',
        bio: 'Competitive FPS streamer and community tournament organizer. Variety indie games and gaming tech enthusiast.',
        niche: 'Gaming & Esports',
        platforms: [
          {
            platform: 'twitch',
            handle: 'lunabyte',
            url: 'https://twitch.tv/lunabyte',
            followers: 340000,
            engagementRate: 7.5,
          },
          {
            platform: 'youtube',
            handle: '@lunabyterecaps',
            url: 'https://youtube.com/@lunabyterecaps',
            followers: 120000,
            engagementRate: 4.2,
          },
        ],
        location: 'Seattle, WA',
        languages: ['English', 'Korean'],
        contentTypes: ['Live Stream Integration', 'Shoutouts', 'Tournament Hosting'],
        rateNotes: 'Stream overlays, live gameplay showcases, and interactive chat activations.',
        isPublic: true,
        totalFollowers: 460000,
      },
      { upsert: true, new: true }
    );

    // 4. Demo Brand 1
    let brand1 = await User.findOne({ email: 'pulse.audio@demo.creatoros.test' });
    if (!brand1) {
      brand1 = await User.create({
        name: 'Pulse Audio Team',
        email: 'pulse.audio@demo.creatoros.test',
        passwordHash,
        role: 'brand',
        status: 'active',
      });
    }
    await BrandProfile.findOneAndUpdate(
      { user: brand1._id },
      {
        user: brand1._id,
        companyName: 'Pulse Audio Labs',
        industry: 'Audio & Consumer Tech',
        website: 'https://pulse-audio.example.com',
        about: 'Creators of studio-grade planar magnetic headphones and streaming broadcast microphones for digital creators.',
        targetAudience: 'Content creators, audio producers, streamers, and audiophiles aged 18-35.',
        isPublic: true,
      },
      { upsert: true, new: true }
    );

    // 5. Demo Brand 2
    let brand2 = await User.findOne({ email: 'zenith.gear@demo.creatoros.test' });
    if (!brand2) {
      brand2 = await User.create({
        name: 'Zenith Activewear',
        email: 'zenith.gear@demo.creatoros.test',
        passwordHash,
        role: 'brand',
        status: 'active',
      });
    }
    await BrandProfile.findOneAndUpdate(
      { user: brand2._id },
      {
        user: brand2._id,
        companyName: 'Zenith Athletic Gear',
        industry: 'Apparel & Fitness',
        website: 'https://zenith-athletics.example.com',
        about: 'Sustainable, high-durability performance apparel engineered for endurance athletes and modern gym routines.',
        targetAudience: 'Fitness enthusiasts, runners, crossfit athletes, and lifestyle creators.',
        isPublic: true,
      },
      { upsert: true, new: true }
    );

    // 6. Demo Freelancer
    let freelancer1 = await User.findOne({ email: 'alex.editor@demo.creatoros.test' });
    if (!freelancer1) {
      freelancer1 = await User.create({
        name: 'Alex Vance',
        email: 'alex.editor@demo.creatoros.test',
        passwordHash,
        role: 'freelancer',
        status: 'active',
      });
    }
    await FreelancerProfile.findOneAndUpdate(
      { user: freelancer1._id },
      {
        user: freelancer1._id,
        headline: 'YouTube Video Editor & Storytelling Specialist',
        skills: ['Premiere Pro', 'DaVinci Resolve', 'Sound Design', 'Pacing & Retention'],
        bio: 'Edited for top YouTube creators with over 10M combined views. Specializing in fast-paced tech and documentary storytelling.',
        portfolioLinks: ['https://youtube.com/@showcase-reel', 'https://vimeo.com/showcase-alex'],
        availability: 'available',
        hourlyRate: 65,
        isPublic: true,
      },
      { upsert: true, new: true }
    );

    logger.info('Demo seed completed successfully. Created labelled demo profiles ending in @demo.creatoros.test');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding demo accounts:', { error });
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
};

void seedDemo();

