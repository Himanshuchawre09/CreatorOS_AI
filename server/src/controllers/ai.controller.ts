import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.service';
import { CreatorProfile } from '../models/creatorProfile.model';
import { BrandProfile } from '../models/brandProfile.model';
import { Campaign } from '../models/campaign.model';

function extractJson(raw: string): any {
  const trimmed = raw.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const toParse = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;
  return JSON.parse(toParse);
}

// Schemas
export const recommendRequestSchema = z.object({
  target: z.enum(['creators', 'campaigns', 'brands']).default('creators'),
  niche: z.string().max(100).optional(),
  goal: z.string().max(200).optional(),
  campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID').optional(),
}).strict();

export const priceEstimateRequestSchema = z.object({
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other']),
  contentType: z.string().min(1).max(100),
  followers: z.number().nonnegative().optional().default(0),
  engagementRate: z.number().nonnegative().max(100).optional(),
  deliverablesSummary: z.string().max(500).optional(),
}).strict();

export const emailDraftRequestSchema = z.object({
  recipientName: z.string().min(1).max(100),
  recipientType: z.enum(['creator', 'brand', 'agency']),
  campaignGoal: z.string().min(1).max(300),
  tone: z.enum(['professional', 'casual', 'enthusiastic']).default('professional'),
  customNotes: z.string().max(500).optional(),
}).strict();

export const analyticsSummaryRequestSchema = z.object({
  collaborationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID').optional(),
  metrics: z.object({
    views: z.number().nonnegative().optional(),
    reach: z.number().nonnegative().optional(),
    clicks: z.number().nonnegative().optional(),
    engagementRate: z.number().nonnegative().optional(),
    impressions: z.number().nonnegative().optional(),
    conversions: z.number().nonnegative().optional(),
  }).strict().optional(),
  campaignContext: z.string().max(300).optional(),
}).strict();

export const contentPlanRequestSchema = z.object({
  niche: z.string().min(2).max(100),
  goal: z.string().min(2).max(200),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other']).optional().default('instagram'),
  timeframeWeeks: z.number().int().min(1).max(12).optional().default(2),
}).strict();

export const getStatus = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      isMock: aiService.isMock(),
      provider: aiService.getProvider().name,
    },
  });
};

export const getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = recommendRequestSchema.parse(req.body);
    let candidates: any[] = [];

    if (validated.target === 'creators') {
      const query: any = { isPublic: true };
      if (validated.niche && validated.niche.trim().length > 0) {
        query.niche = { $regex: validated.niche.trim(), $options: 'i' };
      }
      candidates = await CreatorProfile.find(query).populate('user', 'name avatarUrl').limit(15).lean();
    } else if (validated.target === 'campaigns') {
      const query: any = { status: 'open' };
      candidates = await Campaign.find(query).populate('brand', 'name orgName').limit(15).lean();
    } else {
      candidates = await BrandProfile.find({ isPublic: true }).populate('user', 'name orgName').limit(15).lean();
    }

    if (candidates.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          recommendations: [],
          message: `No ${validated.target} found in database matching criteria.`,
          isMock: aiService.isMock(),
        },
      });
      return;
    }

    // Format candidate summaries for AI prompt
    const candidateSummaries = candidates.map((c) => ({
      id: c._id.toString(),
      displayName: c.displayName || c.companyName || c.title || 'Candidate',
      niche: c.niche || c.industry || 'General',
      platforms: c.platforms || [],
      budget: c.budget || undefined,
      bio: (c.bio || c.about || c.brief || '').substring(0, 150),
    }));

    const prompt = `TASK: RECOMMEND
Target: ${validated.target}
Goal: ${validated.goal || 'General match'}
Niche: ${validated.niche || 'Any'}
Candidates:
${JSON.stringify(candidateSummaries)}

Rank these real candidates from the database and provide match scores (0-100), reasons, and suggested pitch angles.
Return strictly valid JSON in this format:
{"recommendations": [{"candidateId": "ID", "matchScore": 90, "reason": "...", "pitchAngle": "..."}]}`;

    let rawResponse: string;
    try {
      rawResponse = await aiService.generateText(prompt, 10000);
    } catch (err: any) {
      if (err.message && err.message.includes('timed out')) {
        res.status(504).json({ success: false, message: 'AI request timed out after 10 seconds. Please try again.' });
        return;
      }
      throw err;
    }

    let parsed: any;
    try {
      parsed = extractJson(rawResponse);
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Missing recommendations array');
      }
    } catch {
      res.status(502).json({ success: false, message: 'Failed to parse AI response. Please retry.' });
      return;
    }

    // Enrich recommendations with real candidate records, strictly filtering out any nonexistent IDs
    const candidateMap = new Map(candidates.map((c) => [c._id.toString(), c]));
    const enriched = parsed.recommendations
      .filter((r: any) => candidateMap.has(r.candidateId))
      .map((r: any) => {
        const candidate = candidateMap.get(r.candidateId)!;
        return {
          candidateId: r.candidateId,
          matchScore: typeof r.matchScore === 'number' ? r.matchScore : 85,
          reason: r.reason || 'Strong profile synergy.',
          pitchAngle: r.pitchAngle || 'Focus on audience alignment.',
          displayName: candidate.displayName || candidate.companyName || candidate.title || 'Partner',
          niche: candidate.niche || candidate.industry || 'General',
          avatarUrl: candidate.avatarUrl || candidate.logoUrl || (candidate.user && candidate.user.avatarUrl),
          budget: candidate.budget,
          platforms: candidate.platforms,
        };
      });

    res.status(200).json({
      success: true,
      data: {
        recommendations: enriched,
        isMock: aiService.isMock(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPriceEstimate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = priceEstimateRequestSchema.parse(req.body);

    const prompt = `TASK: PRICE_ESTIMATE
Platform: ${validated.platform}
ContentType: ${validated.contentType}
Followers: ${validated.followers}
EngagementRate: ${validated.engagementRate || 'Unknown'}
DeliverablesSummary: ${validated.deliverablesSummary || 'Standard sponsored post'}

Provide a pricing estimate range (minPrice, maxPrice in USD), concise reasoning, and label it as an estimate.
Return strictly valid JSON:
{"minPrice": 100, "maxPrice": 250, "currency": "USD", "reasoning": "...", "disclaimer": "estimate"}`;

    let rawResponse: string;
    try {
      rawResponse = await aiService.generateText(prompt, 10000);
    } catch (err: any) {
      if (err.message && err.message.includes('timed out')) {
        res.status(504).json({ success: false, message: 'AI request timed out after 10 seconds. Please try again.' });
        return;
      }
      throw err;
    }

    let parsed: any;
    try {
      parsed = extractJson(rawResponse);
      if (typeof parsed.minPrice !== 'number' || typeof parsed.maxPrice !== 'number') {
        throw new Error('Invalid price numbers');
      }
    } catch {
      res.status(502).json({ success: false, message: 'Failed to parse AI response. Please retry.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice,
        currency: parsed.currency || 'USD',
        reasoning: parsed.reasoning || 'Calculated based on standard CPM tier metrics.',
        disclaimer: 'estimate',
        isMock: aiService.isMock(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmailDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = emailDraftRequestSchema.parse(req.body);

    const prompt = `TASK: EMAIL_DRAFT
RecipientName: "${validated.recipientName}"
RecipientType: ${validated.recipientType}
CampaignGoal: "${validated.campaignGoal}"
Tone: ${validated.tone}
CustomNotes: "${validated.customNotes || ''}"

Draft a high-converting outreach email with subject line and body.
Return strictly valid JSON:
{"subject": "...", "body": "..."}`;

    let rawResponse: string;
    try {
      rawResponse = await aiService.generateText(prompt, 10000);
    } catch (err: any) {
      if (err.message && err.message.includes('timed out')) {
        res.status(504).json({ success: false, message: 'AI request timed out after 10 seconds. Please try again.' });
        return;
      }
      throw err;
    }

    let parsed: any;
    try {
      parsed = extractJson(rawResponse);
      if (!parsed.subject || !parsed.body) {
        throw new Error('Missing subject or body');
      }
    } catch {
      res.status(502).json({ success: false, message: 'Failed to parse AI response. Please retry.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        subject: parsed.subject,
        body: parsed.body,
        isMock: aiService.isMock(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = analyticsSummaryRequestSchema.parse(req.body);

    const m = validated.metrics;
    const hasRecordedMetrics =
      m &&
      ((typeof m.views === 'number' && m.views > 0) ||
        (typeof m.reach === 'number' && m.reach > 0) ||
        (typeof m.clicks === 'number' && m.clicks > 0) ||
        (typeof m.impressions === 'number' && m.impressions > 0) ||
        (typeof m.conversions === 'number' && m.conversions > 0));

    // If no metrics recorded in stored data, honestly report that without inventing numbers!
    if (!hasRecordedMetrics) {
      res.status(200).json({
        success: true,
        data: {
          summary: 'No stored performance metrics available. Please enter or record metrics before requesting an AI summary.',
          hasData: false,
          insights: [],
          isMock: aiService.isMock(),
        },
      });
      return;
    }

    const prompt = `TASK: ANALYTICS_SUMMARY
Context: "${validated.campaignContext || 'Collaboration campaign'}"
Metrics:
"views": ${m?.views || 0}
"reach": ${m?.reach || 0}
"clicks": ${m?.clicks || 0}
"engagementRate": ${m?.engagementRate || 0}
"conversions": ${m?.conversions || 0}

Summarize ONLY these stored metrics. Do not fabricate or invent any additional metrics or figures.
Return strictly valid JSON:
{"summary": "...", "hasData": true, "insights": ["...", "..."]}`;

    let rawResponse: string;
    try {
      rawResponse = await aiService.generateText(prompt, 10000);
    } catch (err: any) {
      if (err.message && err.message.includes('timed out')) {
        res.status(504).json({ success: false, message: 'AI request timed out after 10 seconds. Please try again.' });
        return;
      }
      throw err;
    }

    let parsed: any;
    try {
      parsed = extractJson(rawResponse);
      if (!parsed.summary) {
        throw new Error('Missing summary');
      }
    } catch {
      res.status(502).json({ success: false, message: 'Failed to parse AI response. Please retry.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        summary: parsed.summary,
        hasData: true,
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        isMock: aiService.isMock(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContentPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = contentPlanRequestSchema.parse(req.body);

    const prompt = `TASK: CONTENT_PLAN
"niche": "${validated.niche}"
Goal: "${validated.goal}"
Platform: "${validated.platform}"
TimeframeWeeks: ${validated.timeframeWeeks}

Generate an actionable content plan with topic ideas, hooks, suggested captions, and hashtags.
Return strictly valid JSON:
{"ideas": [{"title": "...", "hook": "...", "suggestedCaption": "...", "hashtags": ["#tag1"], "format": "..."}]}`;

    let rawResponse: string;
    try {
      rawResponse = await aiService.generateText(prompt, 10000);
    } catch (err: any) {
      if (err.message && err.message.includes('timed out')) {
        res.status(504).json({ success: false, message: 'AI request timed out after 10 seconds. Please try again.' });
        return;
      }
      throw err;
    }

    let parsed: any;
    try {
      parsed = extractJson(rawResponse);
      if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
        throw new Error('Missing ideas array');
      }
    } catch {
      res.status(502).json({ success: false, message: 'Failed to parse AI response. Please retry.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        niche: validated.niche,
        goal: validated.goal,
        platform: validated.platform,
        timeframeWeeks: validated.timeframeWeeks,
        ideas: parsed.ideas,
        isMock: aiService.isMock(),
      },
    });
  } catch (error) {
    next(error);
  }
};
