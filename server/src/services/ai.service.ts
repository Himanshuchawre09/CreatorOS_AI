import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export interface IAIProvider {
  name: string;
  isMock: boolean;
  generateText(prompt: string, timeoutMs?: number): Promise<string>;
}

export class GeminiProvider implements IAIProvider {
  name = 'gemini';
  isMock = false;
  private ai: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = 'gemini-1.5-flash') {
    this.ai = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateText(prompt: string, timeoutMs = 10000): Promise<string> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI request timed out after 10 seconds')), timeoutMs);
    });

    const model = this.ai.getGenerativeModel({ model: this.modelName });
    const generatePromise = model.generateContent(prompt).then((res) => {
      const response = res.response;
      return response.text();
    });

    return Promise.race([generatePromise, timeoutPromise]);
  }
}

export class MockProvider implements IAIProvider {
  name = 'mock';
  isMock = true;

  async generateText(prompt: string, timeoutMs = 10000): Promise<string> {
    // Testing hook: timeout simulation
    if (prompt.includes('__TRIGGER_TIMEOUT__')) {
      await new Promise((resolve) => setTimeout(resolve, timeoutMs + 50));
      throw new Error('AI request timed out after 10 seconds');
    }

    // Testing hook: malformed json simulation
    if (prompt.includes('__TRIGGER_MALFORMED__')) {
      return '<<<MALFORMED_NON_JSON_RESPONSE>>>';
    }

    // RECOMMENDATION PROMPT
    if (prompt.includes('TASK: RECOMMEND')) {
      // Extract candidate IDs passed in the prompt
      const idMatches = [...prompt.matchAll(/"id":\s*"([^"]+)"/g)].map((m) => m[1]);
      const recommendations = idMatches.slice(0, 5).map((id, index) => ({
        candidateId: id,
        matchScore: 95 - index * 6,
        reason: `High audience overlap, verified performance history, and strong thematic alignment with campaign specifications.`,
        pitchAngle: `Emphasize authentic integration into high-performing formats and clear CTA.`,
      }));

      return JSON.stringify({ recommendations });
    }

    // PRICE ESTIMATE PROMPT
    if (prompt.includes('TASK: PRICE_ESTIMATE')) {
      let followers = 10000;
      const followerMatch = prompt.match(/"followers":\s*(\d+)/);
      if (followerMatch && followerMatch[1]) {
        followers = parseInt(followerMatch[1], 10);
      }

      // Base rate calculation based on follower tier ($10-$18 per 1K followers + base)
      const baseRate = Math.max(75, Math.round(followers * 0.015));
      const minPrice = Math.round(baseRate * 0.85);
      const maxPrice = Math.round(baseRate * 1.35);

      return JSON.stringify({
        minPrice,
        maxPrice,
        currency: 'USD',
        reasoning: `Based on an audience of ${followers.toLocaleString()} and typical industry CPM benchmarks ($12-$18 CPM), deliverables in this format typically yield between $${minPrice} and $${maxPrice} depending on exclusivity and usage rights.`,
        disclaimer: 'estimate',
      });
    }

    // EMAIL DRAFT PROMPT
    if (prompt.includes('TASK: EMAIL_DRAFT')) {
      const recipientMatch = prompt.match(/RecipientName:\s*"([^"]+)"/i) || prompt.match(/"recipientName":\s*"([^"]+)"/i);
      const recipientName = recipientMatch ? recipientMatch[1] : 'Partner';

      return JSON.stringify({
        subject: `Partnership Inquiry: Collaborative Campaign Opportunity`,
        body: `Hi ${recipientName},\n\nI hope this email finds you well.\n\nWe have been closely following your content and admire the high quality and thoughtful engagement you share with your community. We believe your style strongly resonates with our current campaign goals.\n\nWe would love to discuss a potential collaboration covering sponsored deliverables and dedicated brand integration. Are you available for a brief chat this week to explore this further?\n\nBest regards,\nPartnerships Team`,
      });
    }

    // ANALYTICS SUMMARY PROMPT
    if (prompt.includes('TASK: ANALYTICS_SUMMARY')) {
      // Check if metrics exist in prompt
      const viewsMatch = prompt.match(/"views":\s*(\d+)/);
      const reachMatch = prompt.match(/"reach":\s*(\d+)/);
      const clicksMatch = prompt.match(/"clicks":\s*(\d+)/);

      const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;
      const reach = reachMatch ? parseInt(reachMatch[1], 10) : 0;
      const clicks = clicksMatch ? parseInt(clicksMatch[1], 10) : 0;

      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0';

      return JSON.stringify({
        summary: `The campaign achieved ${views.toLocaleString()} verified views across targeted placements with a cumulative reach of ${reach.toLocaleString()}. Direct engagement produced ${clicks.toLocaleString()} link clicks, establishing a strong click-through rate of ${ctr}%.`,
        hasData: true,
        insights: [
          `Audience attention was high with ${views.toLocaleString()} views generated across tracked deliverables.`,
          `Conversion intent is demonstrated with ${clicks.toLocaleString()} clicks, reflecting a solid ${ctr}% click-through efficiency.`,
          `Recommendations: Scale top-performing formats and optimize call-to-action placement for subsequent runs.`,
        ],
      });
    }

    // CONTENT PLAN PROMPT
    if (prompt.includes('TASK: CONTENT_PLAN')) {
      const nicheMatch = prompt.match(/"niche":\s*"([^"]+)"/);
      const niche = nicheMatch ? nicheMatch[1] : 'General';

      return JSON.stringify({
        niche,
        ideas: [
          {
            title: `3 Essential Rules for Excelling in ${niche}`,
            hook: `Stop doing this one mistake if you want real results in ${niche}!`,
            suggestedCaption: `Mastering ${niche} doesn't have to be complicated. Here are the 3 foundational frameworks you should implement today. Save this post for your next session!`,
            hashtags: [`#${niche.toLowerCase().replace(/\s+/g, '')}`, '#creatorgrowth', '#protips', '#learnwithme'],
            format: 'Short-form Video / Carousel',
          },
          {
            title: `Behind the Scenes: A Day in the Life`,
            hook: `What nobody tells you about building in ${niche}...`,
            suggestedCaption: `Take a look behind the curtain. Here is our unedited workflow and how we solve everyday bottlenecks. Which part surprised you most?`,
            hashtags: [`#${niche.toLowerCase().replace(/\s+/g, '')}`, '#behindthescenes', '#creatorlife'],
            format: 'Reel / Story Series',
          },
          {
            title: `The Ultimate Toolkit Breakdown`,
            hook: `These 5 tools saved me 10+ hours this week.`,
            suggestedCaption: `Efficiency is key. Here are the top tools that streamlined our output this month. Drop a comment below if you want the full checklist!`,
            hashtags: [`#${niche.toLowerCase().replace(/\s+/g, '')}`, '#productivity', '#tools'],
            format: 'Infographic / Carousel',
          },
        ],
      });
    }

    // Fallback default
    return JSON.stringify({
      message: 'Processed by CreatorOS AI Assistant',
      success: true,
    });
  }
}

export class AIService {
  private provider: IAIProvider;

  constructor() {
    this.provider = this.createDefaultProvider();
  }

  private createDefaultProvider(): IAIProvider {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0 && env.NODE_ENV !== 'test') {
      return new GeminiProvider(env.GEMINI_API_KEY.trim());
    }
    return new MockProvider();
  }

  public getProvider(): IAIProvider {
    return this.provider;
  }

  public setProvider(provider: IAIProvider): void {
    this.provider = provider;
  }

  public resetProvider(): void {
    this.provider = this.createDefaultProvider();
  }

  public isMock(): boolean {
    return this.provider.isMock;
  }

  public async generateText(prompt: string, timeoutMs = 10000): Promise<string> {
    return this.provider.generateText(prompt, timeoutMs);
  }
}

export const aiService = new AIService();
