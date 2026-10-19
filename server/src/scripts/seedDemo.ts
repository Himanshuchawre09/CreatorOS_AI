import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from '../config/db';
import {
  User,
  CreatorProfile,
  BrandProfile,
  FreelancerProfile,
  TalentManagerProfile,
  TalentLink,
  PortfolioItem,
  Campaign,
  CollaborationRequest,
  Contract,
  Task,
  Submission,
  Invoice,
  CalendarPost,
  CollaborationAnalytics,
  Review,
  Notification,
  Message,
} from '../models';
import { logger } from '../utils/logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
if (isProduction) {
  logger.error('Error: seed:demo cannot be run in a production environment.');
  process.exit(1);
}

const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
if (!DEMO_PASSWORD) {
  logger.error('Error: DEMO_PASSWORD environment variable is required to run seed:demo.');
  process.exit(1);
}

const seedDemo = async (): Promise<void> => {
  try {
    await connectDatabase();
    logger.info('Starting demo seed (emails ending with @demo.creatoros.test)...');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    // 1. Tech Creator Demo (Sarah Chen)
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

    // 2. Fitness & Health Creator Demo (Marcus Miller)
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

    // 3. Gaming & Streaming Creator Demo (Luna Zhao)
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

    // 4. Brand 1 (Pulse Audio Labs)
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

    // 5. Brand 2 (Zenith Athletic Gear)
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

    // 6. Freelancer (Alex Vance)
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

    // 7. Talent Manager (Claire Dupont)
    let talentMgr = await User.findOne({ email: 'talent.claire@demo.creatoros.test' });
    if (!talentMgr) {
      talentMgr = await User.create({
        name: 'Claire Dupont',
        email: 'talent.claire@demo.creatoros.test',
        passwordHash,
        role: 'talentManager',
        status: 'active',
      });
    }
    await TalentManagerProfile.findOneAndUpdate(
      { user: talentMgr._id },
      {
        user: talentMgr._id,
        agencyName: 'Vanguard Creator Agency',
        about: 'Boutique talent management firm representing premier tech, hardware, and engineering storytellers.',
        website: 'https://vanguard-agency.example.com',
      },
      { upsert: true, new: true }
    );

    // Talent link between Claire and Sarah Chen (active)
    await TalentLink.findOneAndUpdate(
      { talentManager: talentMgr._id, creator: creator1._id },
      {
        talentManager: talentMgr._id,
        creator: creator1._id,
        status: 'active',
        inviteNotes: 'Representing Sarah Chen for brand partnerships and sponsorships.',
        respondedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 8. Demo Campaigns
    // Campaign A: Pulse Microphone Pro Series (inProgress with active collaboration)
    const campaignA = await Campaign.findOneAndUpdate(
      { brand: brand1._id, title: 'Creator Studio Microphone Pro Series' },
      {
        brand: brand1._id,
        title: 'Creator Studio Microphone Pro Series',
        brief: 'Seeking in-depth studio audio reviews and real desk setup integration showcases for our new XLR/USB broadcast microphone.',
        goals: ['Showcase audio clarity', 'Demonstrate noise floor rejection', 'Drive creator pre-orders'],
        audience: 'Desk setup enthusiasts, podcasters, streamers, and video producers.',
        deliverables: [
          { type: 'Dedicated YouTube Review', count: 1, details: 'Full 8-12 min review with sound samples.' },
          { type: 'Instagram Reel / Short', count: 1, details: 'Quick setup tip showing the acoustic isolation mount.' },
        ],
        budget: 2200,
        currency: 'USD',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'inProgress',
      },
      { upsert: true, new: true }
    );

    // Campaign B: Pulse Studio Wireless Headphone Launch (open for applications)
    await Campaign.findOneAndUpdate(
      { brand: brand1._id, title: 'Pulse Wireless Planar Magnetic Headphone Launch' },
      {
        brand: brand1._id,
        title: 'Pulse Wireless Planar Magnetic Headphone Launch',
        brief: 'Global launch for ultra-low latency wireless audiophile headphones. Seeking tech and gaming reviewers for launch week.',
        goals: ['Build launch day buzz', 'Highlight dual-wireless low-latency dongle'],
        audience: 'Gamers, audio producers, and high-fidelity music listeners.',
        deliverables: [
          { type: 'YouTube Integration', count: 1, details: '60-90 second mid-roll segment.' },
        ],
        budget: 3500,
        currency: 'USD',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'open',
      },
      { upsert: true, new: true }
    );

    // Campaign C: Zenith Activewear Summer Endurance Campaign (open)
    const campaignC = await Campaign.findOneAndUpdate(
      { brand: brand2._id, title: 'Zenith Activewear Summer Endurance Challenge' },
      {
        brand: brand2._id,
        title: 'Zenith Activewear Summer Endurance Challenge',
        brief: 'Promoting our recycled breathable training line through authentic outdoor calisthenics and runner training sessions.',
        goals: ['Demonstrate moisture wicking durability', 'Promote summer training collection'],
        audience: 'Crossfit athletes, runners, and fitness enthusiasts.',
        deliverables: [
          { type: 'Instagram Reel', count: 2, details: 'Training sessions wearing the Zenith Pace collection.' },
        ],
        budget: 1800,
        currency: 'USD',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'open',
      },
      { upsert: true, new: true }
    );

    // 9. Collaboration Requests & Active Collaboration
    // Request 1: Pulse Audio -> Sarah Chen (Accepted)
    const request1 = await CollaborationRequest.findOneAndUpdate(
      { campaign: campaignA._id, creator: creator1._id },
      {
        campaign: campaignA._id,
        brand: brand1._id,
        creator: creator1._id,
        sender: brand1._id,
        recipient: creator1._id,
        pitch: 'Hi Sarah, we love your audio testing rig and would love to partner with you for our Microphone Pro series.',
        proposedRate: 2200,
        currency: 'USD',
        status: 'accepted',
        respondedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Request 2: Marcus Miller -> Zenith Activewear (Pending application)
    await CollaborationRequest.findOneAndUpdate(
      { campaign: campaignC._id, creator: creator2._id },
      {
        campaign: campaignC._id,
        brand: brand2._id,
        creator: creator2._id,
        sender: creator2._id,
        recipient: brand2._id,
        pitch: 'Hi Zenith team, I train daily in Austin heat and would love to put your Pace collection to the test in my calisthenics tutorials.',
        proposedRate: 1800,
        currency: 'USD',
        status: 'pending',
      },
      { upsert: true, new: true }
    );

    // 10. Contract for Request 1 (Signed by both parties)
    const contract1 = await Contract.findOneAndUpdate(
      { collaborationRequest: request1._id },
      {
        collaborationRequest: request1._id,
        campaign: campaignA._id,
        brand: brand1._id,
        creator: creator1._id,
        deliverables: [
          { type: 'Dedicated YouTube Review', count: 1, details: 'Full 8-12 min review with sound samples.' },
          { type: 'Instagram Reel / Short', count: 1, details: 'Quick setup tip showing the acoustic isolation mount.' },
        ],
        budget: 2200,
        currency: 'USD',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        notes: 'Creator retains editorial independence. Includes one round of factual accuracy feedback prior to public posting.',
        status: 'signed',
        brandSignedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        creatorSignedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // 11. Collaboration Tasks
    await Task.findOneAndUpdate(
      { collaborationRequest: request1._id, title: 'Script Outline & Audio Test Plan' },
      {
        collaborationRequest: request1._id,
        contract: contract1._id,
        creator: creator1._id,
        assignee: creator1._id,
        title: 'Script Outline & Audio Test Plan',
        description: 'Outline key comparison microphones and isolation filter tests.',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'done',
        order: 0,
      },
      { upsert: true, new: true }
    );

    await Task.findOneAndUpdate(
      { collaborationRequest: request1._id, title: 'A-Roll Video Recording & Sound Check' },
      {
        collaborationRequest: request1._id,
        contract: contract1._id,
        creator: creator1._id,
        assignee: creator1._id,
        title: 'A-Roll Video Recording & Sound Check',
        description: 'Record desk setup footage and microphone sound comparisons.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'doing',
        order: 1,
      },
      { upsert: true, new: true }
    );

    await Task.findOneAndUpdate(
      { collaborationRequest: request1._id, title: 'Final Video Render & Upload Deliverable' },
      {
        collaborationRequest: request1._id,
        contract: contract1._id,
        creator: creator1._id,
        assignee: creator1._id,
        title: 'Final Video Render & Upload Deliverable',
        description: 'Export 4K render and upload to CreatorOS for brand review.',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'todo',
        order: 2,
      },
      { upsert: true, new: true }
    );

    // 12. Content Submission
    await Submission.findOneAndUpdate(
      { collaborationRequest: request1._id, title: 'Pulse Pro Microphone First Cut' },
      {
        collaborationRequest: request1._id,
        contract: contract1._id,
        creator: creator1._id,
        brand: brand1._id,
        title: 'Pulse Pro Microphone First Cut',
        description: 'Initial cut including frequency comparison test and desk arm clamp demo.',
        version: 1,
        file: {
          filename: 'demo-pulse-first-cut.mp4',
          originalName: 'pulse_mic_review_v1.mp4',
          mimeType: 'video/mp4',
          size: 15400200,
          path: 'uploads/demo-pulse-first-cut.mp4',
        },
        status: 'approved',
        feedback: 'Audio clarity is exceptional. Approved without further revisions.',
        feedbackAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        revisions: [
          {
            version: 1,
            file: {
              filename: 'demo-pulse-first-cut.mp4',
              originalName: 'pulse_mic_review_v1.mp4',
              mimeType: 'video/mp4',
              size: 15400200,
              path: 'uploads/demo-pulse-first-cut.mp4',
            },
            status: 'approved',
            feedback: 'Audio clarity is exceptional. Approved without further revisions.',
            feedbackAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      { upsert: true, new: true }
    );

    // 13. Invoice
    await Invoice.findOneAndUpdate(
      { collaborationRequest: request1._id, invoiceNumber: 'INV-2026-0001' },
      {
        invoiceNumber: 'INV-2026-0001',
        collaborationRequest: request1._id,
        contract: contract1._id,
        issuer: creator1._id,
        client: brand1._id,
        amount: 2200,
        currency: 'USD',
        description: 'Pulse Studio Microphone Review — Full production & usage license',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'paid',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Paid via bank transfer. Self-reported invoice status tracking.',
      },
      { upsert: true, new: true }
    );

    // 14. Self-reported Collaboration Analytics
    await CollaborationAnalytics.findOneAndUpdate(
      { collaborationRequest: request1._id },
      {
        collaborationRequest: request1._id,
        creator: creator1._id,
        brand: brand1._id,
        views: 48500,
        reach: 82000,
        clicks: 1420,
        engagement: 5650,
        notes: 'Initial 48-hour video metrics from Sarah Chen Tech YouTube channel.',
        lastReportedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 15. Mutual Reviews
    await Review.findOneAndUpdate(
      { collaborationRequest: request1._id, reviewer: brand1._id },
      {
        collaborationRequest: request1._id,
        reviewer: brand1._id,
        reviewee: creator1._id,
        rating: 5,
        comment: 'Exceptional production quality and technical depth. Sarah delivered ahead of schedule and the audio clarity test resonated strongly with the audience.',
      },
      { upsert: true, new: true }
    );

    await Review.findOneAndUpdate(
      { collaborationRequest: request1._id, reviewer: creator1._id },
      {
        collaborationRequest: request1._id,
        reviewer: creator1._id,
        reviewee: brand1._id,
        rating: 5,
        comment: 'Pulse Audio was fantastic to work with. Clear creative brief, fast feedback, and respected creative freedom throughout the review process.',
      },
      { upsert: true, new: true }
    );

    // 16. Content Calendar Post
    await CalendarPost.findOneAndUpdate(
      { owner: creator1._id, title: 'Pulse Pro Microphone Video Goes Live' },
      {
        owner: creator1._id,
        collaborationRequest: request1._id,
        title: 'Pulse Pro Microphone Video Goes Live',
        description: 'Publishing dedicated YouTube review and pinning affiliate link in description.',
        platform: 'youtube',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
      },
      { upsert: true, new: true }
    );

    // 17. Messages between Brand and Creator
    await Message.findOneAndUpdate(
      { collaborationRequest: request1._id, text: 'Hi Sarah! Contract is countersigned. Really excited to collaborate on this!' },
      {
        collaborationRequest: request1._id,
        sender: brand1._id,
        recipient: creator1._id,
        text: 'Hi Sarah! Contract is countersigned. Really excited to collaborate on this!',
      },
      { upsert: true, new: true }
    );

    await Message.findOneAndUpdate(
      { collaborationRequest: request1._id, text: 'Thanks Pulse team! The sample unit arrived yesterday. Acoustic testing looks great.' },
      {
        collaborationRequest: request1._id,
        sender: creator1._id,
        recipient: brand1._id,
        text: 'Thanks Pulse team! The sample unit arrived yesterday. Acoustic testing looks great.',
      },
      { upsert: true, new: true }
    );

    // 18. Notifications
    await Notification.findOneAndUpdate(
      { recipient: creator1._id, title: 'Contract Signed' },
      {
        recipient: creator1._id,
        title: 'Contract Signed',
        message: 'Pulse Audio Team countersigned the agreement for Creator Studio Microphone Pro Series.',
        type: 'contract_signed',
        link: `/contracts/${contract1._id}`,
        read: true,
      },
      { upsert: true, new: true }
    );

    await Notification.findOneAndUpdate(
      { recipient: creator1._id, title: 'Invoice Marked Paid' },
      {
        recipient: creator1._id,
        title: 'Invoice Marked Paid',
        message: 'Invoice INV-2026-0001 ($2,200.00) has been marked as paid.',
        type: 'invoice_status',
        link: '/invoices',
        read: false,
      },
      { upsert: true, new: true }
    );

    logger.info('Demo seed completed successfully. Created labelled demo profiles, campaigns, requests, contracts, deliverables, invoices, reviews, and tasks.');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding demo accounts:', { error });
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
};

void seedDemo();
