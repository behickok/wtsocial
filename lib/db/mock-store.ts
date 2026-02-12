import type { ContentStatusType } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MockOrganization {
  id: string;
  name: string;
  settings: {
    ai: {
      model: string;
      temperature: number;
      maxTokens: number;
    };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSource {
  id: string;
  organizationId: string;
  type: "rss" | "manual";
  name: string;
  url: string;
  schedule: string | null;
  active: boolean;
  lastPolledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockContentItem {
  id: string;
  organizationId: string;
  sourceId: string | null;
  originalUrl: string;
  title: string | null;
  author: string | null;
  publishedDate: Date | null;
  sourceDomain: string | null;
  rawContent: string | null;
  featuredImage: string | null;
  status: ContentStatusType;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSummary {
  id: string;
  contentItemId: string;
  promptTemplateId: string | null;
  modelUsed: string;
  body: string;
  knote: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPublishTarget {
  id: string;
  organizationId: string;
  type: "wix" | "linkedin" | "hubspot";
  name: string;
  settings: Record<string, unknown>;
  active: boolean;
  connected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPublishRecord {
  id: string;
  contentItemId: string;
  targetId: string;
  externalId: string | null;
  status: "pending" | "published" | "failed";
  publishedAt: Date | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPipelineRun {
  id: string;
  contentItemId: string;
  stages: { stage: string; success: boolean; startedAt: string; completedAt: string }[];
  currentStage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  errors: string[];
}

export interface MockPromptTemplate {
  id: string;
  organizationId: string;
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockHistoryEvent {
  id: string;
  type: "pipeline_run" | "published" | "ingested" | "approved" | "rejected" | "failed";
  contentItemId: string;
  title: string;
  stage: string | null;
  status: string;
  channel: string | null;
  timestamp: Date;
  details: string | null;
}

export interface MockStore {
  organization: MockOrganization;
  sources: MockSource[];
  contentItems: MockContentItem[];
  summaries: MockSummary[];
  publishTargets: MockPublishTarget[];
  publishRecords: MockPublishRecord[];
  pipelineRuns: MockPipelineRun[];
  promptTemplates: MockPromptTemplate[];
  historyEvents: MockHistoryEvent[];
  _counter: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

function nextId(store: MockStore): string {
  store._counter++;
  return `mock_${store._counter}`;
}

export function titleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const slug = pathname.split("/").filter(Boolean).pop() || "";
    return (
      slug
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim() || "Untitled Article"
    );
  } catch {
    return "Untitled Article";
  }
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

function createSeedData(): MockStore {
  const ORG_ID = "org_1";

  const organization: MockOrganization = {
    id: ORG_ID,
    name: "WealthTech Strategy Partners",
    settings: {
      ai: {
        model: "claude-sonnet-4-5-20250514",
        temperature: 0.3,
        maxTokens: 1500,
      },
    },
    branding: {
      primaryColor: "#1a365d",
      secondaryColor: "#2b6cb0",
      logoUrl: "",
    },
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  };

  const sources: MockSource[] = [
    {
      id: "src_1",
      organizationId: ORG_ID,
      type: "rss",
      name: "WealthManagement.com",
      url: "https://www.wealthmanagement.com/rss",
      schedule: "0 */4 * * *",
      active: true,
      lastPolledAt: hoursAgo(2),
      createdAt: daysAgo(25),
      updatedAt: hoursAgo(2),
    },
    {
      id: "src_2",
      organizationId: ORG_ID,
      type: "rss",
      name: "RIABiz",
      url: "https://riabiz.com/feed",
      schedule: "0 */6 * * *",
      active: true,
      lastPolledAt: hoursAgo(5),
      createdAt: daysAgo(25),
      updatedAt: hoursAgo(5),
    },
    {
      id: "src_3",
      organizationId: ORG_ID,
      type: "rss",
      name: "Financial Planning Magazine",
      url: "https://www.financial-planning.com/feed",
      schedule: "0 8 * * *",
      active: false,
      lastPolledAt: daysAgo(3),
      createdAt: daysAgo(20),
      updatedAt: daysAgo(3),
    },
    {
      id: "src_4",
      organizationId: ORG_ID,
      type: "manual",
      name: "Manual Research",
      url: "https://wtsp.dev",
      schedule: null,
      active: true,
      lastPolledAt: null,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(25),
    },
  ];

  const contentItems: MockContentItem[] = [
    {
      id: "ci_1",
      organizationId: ORG_ID,
      sourceId: "src_1",
      originalUrl: "https://www.wealthmanagement.com/technology/orion-redtail-partnership",
      title: "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology",
      author: "J. Smith",
      publishedDate: daysAgo(3),
      sourceDomain: "wealthmanagement.com",
      rawContent: null,
      featuredImage: null,
      status: "published",
      metadata: {},
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
    {
      id: "ci_2",
      organizationId: ORG_ID,
      sourceId: "src_2",
      originalUrl: "https://riabiz.com/schwab-ai-portfolio-analytics",
      title: "Schwab Launches AI-Powered Portfolio Analytics for Independent Advisors",
      author: "M. Chen",
      publishedDate: daysAgo(1),
      sourceDomain: "riabiz.com",
      rawContent: null,
      featuredImage: null,
      status: "ready_for_review",
      metadata: {},
      createdAt: hoursAgo(4),
      updatedAt: hoursAgo(4),
    },
    {
      id: "ci_3",
      organizationId: ORG_ID,
      sourceId: "src_3",
      originalUrl: "https://www.financial-planning.com/envestnet-data-aggregation",
      title: "Envestnet Unveils Next-Generation Data Aggregation Platform",
      author: "R. Patel",
      publishedDate: daysAgo(1),
      sourceDomain: "financial-planning.com",
      rawContent: null,
      featuredImage: null,
      status: "ready_for_review",
      metadata: {},
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
    },
    {
      id: "ci_4",
      organizationId: ORG_ID,
      sourceId: "src_1",
      originalUrl: "https://www.wealthmanagement.com/technology/blackrock-aladdin-expansion",
      title: "BlackRock Expands Aladdin Wealth to Serve Mid-Market RIAs",
      author: "L. Torres",
      publishedDate: daysAgo(1),
      sourceDomain: "wealthmanagement.com",
      rawContent: null,
      featuredImage: null,
      status: "approved",
      metadata: {},
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(1),
    },
    {
      id: "ci_5",
      organizationId: ORG_ID,
      sourceId: "src_4",
      originalUrl: "https://www.fnzgroup.com/news/investcloud-acquisition",
      title: "FNZ Group Completes Landmark Acquisition of InvestCloud",
      author: null,
      publishedDate: null,
      sourceDomain: "fnzgroup.com",
      rawContent: null,
      featuredImage: null,
      status: "ingested",
      metadata: {},
      createdAt: hoursAgo(0.5),
      updatedAt: hoursAgo(0.5),
    },
    {
      id: "ci_6",
      organizationId: ORG_ID,
      sourceId: "src_2",
      originalUrl: "https://riabiz.com/morgan-stanley-etrade-dashboard",
      title: "Morgan Stanley Enhances E*TRADE Advisor Dashboard",
      author: "K. Williams",
      publishedDate: daysAgo(2),
      sourceDomain: "riabiz.com",
      rawContent: null,
      featuredImage: null,
      status: "failed",
      metadata: { failReason: "LLM rate limit exceeded during summarization" },
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: "ci_7",
      organizationId: ORG_ID,
      sourceId: "src_3",
      originalUrl: "https://www.financial-planning.com/riskalyze-nitrogen-rebrand",
      title: "Riskalyze Officially Rebrands as Nitrogen, Expands Risk Platform",
      author: "A. Johnson",
      publishedDate: daysAgo(6),
      sourceDomain: "financial-planning.com",
      rawContent: null,
      featuredImage: null,
      status: "published",
      metadata: {},
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
  ];

  const summaries: MockSummary[] = [
    {
      id: "sum_1",
      contentItemId: "ci_1",
      promptTemplateId: "pt_1",
      modelUsed: "claude-sonnet-4-5-20250514",
      body: `Smith, J. (2026, February 10). "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology." WealthManagement.com.

Orion Advisor Solutions has formalized a strategic partnership with Redtail Technology, the widely-adopted CRM platform serving over 100,000 financial professionals. The collaboration will focus on deepening data integrations between Orion's portfolio management platform and Redtail's client relationship tools, enabling advisors to streamline workflows across their technology stack.

Industry analysts view this partnership as a significant step toward the integrated advisor workstation concept that has been gaining traction across the wealthtech landscape. The enhanced integration is expected to reduce manual data entry for advisors by up to 40%, according to preliminary estimates from both companies.

Source: https://www.wealthmanagement.com/technology/orion-redtail-partnership`,
      knote: "This partnership strengthens Orion's ecosystem play. Worth watching whether this leads to deeper consolidation or remains a data-integration-only arrangement.",
      version: 1,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
    {
      id: "sum_2",
      contentItemId: "ci_2",
      promptTemplateId: "pt_1",
      modelUsed: "claude-sonnet-4-5-20250514",
      body: `Chen, M. (2026, February 11). "Schwab Launches AI-Powered Portfolio Analytics for Independent Advisors." RIABiz.

Charles Schwab has unveiled a new suite of artificial intelligence-driven portfolio analytics tools designed specifically for independent registered investment advisors using its custodial platform. The toolset leverages machine learning models to identify portfolio drift, tax-loss harvesting opportunities, and client risk alignment issues in real-time.

The move signals Schwab's commitment to keeping pace with the growing demand for AI-enhanced advisory capabilities, particularly as competitors like Fidelity and Pershing have introduced similar features in recent months. Early beta testers report that the AI recommendations have helped identify an average of 15-20 actionable insights per client portfolio review.

Source: https://riabiz.com/schwab-ai-portfolio-analytics`,
      knote: null,
      version: 1,
      createdAt: hoursAgo(4),
      updatedAt: hoursAgo(4),
    },
    {
      id: "sum_3",
      contentItemId: "ci_3",
      promptTemplateId: "pt_1",
      modelUsed: "claude-sonnet-4-5-20250514",
      body: `Patel, R. (2026, February 11). "Envestnet Unveils Next-Generation Data Aggregation Platform." Financial Planning Magazine.

Envestnet has announced the launch of its next-generation data aggregation platform, representing a complete architectural overhaul of the company's data connectivity infrastructure. The new platform promises to deliver real-time data feeds from over 17,000 financial institutions, a significant upgrade from the batch-processing model used in its predecessor.

The platform also introduces enhanced data normalization capabilities, enabling advisors and fintech developers to access cleaner, more standardized financial data through a unified API. Envestnet reports that early adopters have seen data refresh times drop from hours to under 60 seconds, a development that could fundamentally change how wealth management applications consume account data.

Source: https://www.financial-planning.com/envestnet-data-aggregation`,
      knote: null,
      version: 1,
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
    },
    {
      id: "sum_4",
      contentItemId: "ci_4",
      promptTemplateId: "pt_1",
      modelUsed: "claude-sonnet-4-5-20250514",
      body: `Torres, L. (2026, February 11). "BlackRock Expands Aladdin Wealth to Serve Mid-Market RIAs." WealthManagement.com.

BlackRock is expanding the reach of its Aladdin Wealth platform to serve mid-market registered investment advisors, a segment previously underserved by the enterprise-grade technology. The new Aladdin Wealth Essentials tier will offer a streamlined version of the platform's risk analytics and portfolio construction tools at a price point accessible to firms managing between $500 million and $5 billion in assets.

This strategic move positions BlackRock to capture a significant share of the advisor technology market by bringing institutional-quality risk management tools to a broader audience. The expansion comes as mid-market RIAs increasingly seek sophisticated technology solutions that were historically available only to the largest wealth management firms.

Source: https://www.wealthmanagement.com/technology/blackrock-aladdin-expansion`,
      knote: "BlackRock entering the mid-market is a big deal. This could disrupt the existing risk analytics players like Riskalyze/Nitrogen and HiddenLevers. WTSP should cover this in depth.",
      version: 1,
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(1),
    },
    {
      id: "sum_7",
      contentItemId: "ci_7",
      promptTemplateId: "pt_1",
      modelUsed: "claude-sonnet-4-5-20250514",
      body: `Johnson, A. (2026, February 7). "Riskalyze Officially Rebrands as Nitrogen, Expands Risk Platform." Financial Planning Magazine.

Riskalyze, the popular risk assessment platform used by thousands of financial advisors, has officially completed its rebrand to Nitrogen. The name change, first announced in late 2025, reflects the company's evolution beyond its original risk number concept into a comprehensive wealth management growth platform.

Under the Nitrogen brand, the company has launched several new product modules including client acquisition analytics, compliance monitoring, and practice management benchmarking tools. CEO Aaron Klein stated that the rebrand represents "the next chapter" of the company's mission to empower advisors with data-driven growth tools beyond risk assessment.

Source: https://www.financial-planning.com/riskalyze-nitrogen-rebrand`,
      knote: "Interesting strategic evolution. The rebrand signals their ambition to compete directly with broader advisor platforms. Monitor adoption rates of the new modules.",
      version: 1,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
  ];

  const publishTargets: MockPublishTarget[] = [
    {
      id: "pt_target_1",
      organizationId: ORG_ID,
      type: "wix",
      name: "Wix Blog - WTSP",
      settings: { siteUrl: "https://wtsp.dev" },
      active: true,
      connected: true,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    },
    {
      id: "pt_target_2",
      organizationId: ORG_ID,
      type: "linkedin",
      name: "LinkedIn - WTSP",
      settings: { companyId: "wtsp-official" },
      active: true,
      connected: true,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    },
    {
      id: "pt_target_3",
      organizationId: ORG_ID,
      type: "hubspot",
      name: "HubSpot Newsletter",
      settings: {},
      active: false,
      connected: false,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    },
  ];

  const publishRecords: MockPublishRecord[] = [
    {
      id: "pr_1",
      contentItemId: "ci_1",
      targetId: "pt_target_1",
      externalId: "wix-post-1234",
      status: "published",
      publishedAt: daysAgo(2),
      errorMessage: null,
      attempts: 1,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "pr_2",
      contentItemId: "ci_1",
      targetId: "pt_target_2",
      externalId: "li-post-5678",
      status: "published",
      publishedAt: daysAgo(2),
      errorMessage: null,
      attempts: 1,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "pr_3",
      contentItemId: "ci_7",
      targetId: "pt_target_1",
      externalId: "wix-post-0987",
      status: "published",
      publishedAt: daysAgo(5),
      errorMessage: null,
      attempts: 1,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
  ];

  const pipelineRuns: MockPipelineRun[] = [
    {
      id: "run_1",
      contentItemId: "ci_1",
      stages: [
        { stage: "summarization", success: true, startedAt: daysAgo(3).toISOString(), completedAt: daysAgo(3).toISOString() },
        { stage: "image_generation", success: true, startedAt: daysAgo(3).toISOString(), completedAt: daysAgo(3).toISOString() },
        { stage: "review", success: true, startedAt: daysAgo(3).toISOString(), completedAt: daysAgo(2).toISOString() },
        { stage: "publishing", success: true, startedAt: daysAgo(2).toISOString(), completedAt: daysAgo(2).toISOString() },
      ],
      currentStage: null,
      startedAt: daysAgo(3),
      completedAt: daysAgo(2),
      errors: [],
    },
    {
      id: "run_2",
      contentItemId: "ci_2",
      stages: [
        { stage: "summarization", success: true, startedAt: hoursAgo(4).toISOString(), completedAt: hoursAgo(4).toISOString() },
        { stage: "image_generation", success: true, startedAt: hoursAgo(4).toISOString(), completedAt: hoursAgo(4).toISOString() },
      ],
      currentStage: "review",
      startedAt: hoursAgo(4),
      completedAt: null,
      errors: [],
    },
    {
      id: "run_3",
      contentItemId: "ci_6",
      stages: [
        { stage: "summarization", success: false, startedAt: daysAgo(1).toISOString(), completedAt: daysAgo(1).toISOString() },
      ],
      currentStage: null,
      startedAt: daysAgo(1),
      completedAt: daysAgo(1),
      errors: ["LLM rate limit exceeded during summarization"],
    },
    {
      id: "run_7",
      contentItemId: "ci_7",
      stages: [
        { stage: "summarization", success: true, startedAt: daysAgo(5).toISOString(), completedAt: daysAgo(5).toISOString() },
        { stage: "image_generation", success: true, startedAt: daysAgo(5).toISOString(), completedAt: daysAgo(5).toISOString() },
        { stage: "review", success: true, startedAt: daysAgo(5).toISOString(), completedAt: daysAgo(5).toISOString() },
        { stage: "publishing", success: true, startedAt: daysAgo(5).toISOString(), completedAt: daysAgo(5).toISOString() },
      ],
      currentStage: null,
      startedAt: daysAgo(5),
      completedAt: daysAgo(5),
      errors: [],
    },
  ];

  const promptTemplates: MockPromptTemplate[] = [
    {
      id: "pt_1",
      organizationId: ORG_ID,
      name: "Individual News Post",
      systemPrompt: `You are a professional financial technology content writer for WealthTech Strategy Partners (WTSP). Your task is to summarize wealthtech industry news articles into concise, informative blog posts.

Your writing style:
- Professional, third-person tone
- Clear and accessible to financial technology professionals
- Factual and balanced, avoiding sensationalism
- Consistent terminology aligned with wealthtech industry standards

Output format:
- Start with an academic-style citation: Author Last Name, First Initial. (Date). "Article Title." Source Name. URL
- Write 2-3 paragraphs summarizing the key points
- Focus on the significance and implications for the wealthtech industry
- End with [KNOTE_PLACEHOLDER] where editorial commentary will be added
- Include the source link at the bottom`,
      userPromptTemplate: `Please summarize the following article into a WealthTech Strategy Partners blog post format:

Title: {{article_title}}
Source: {{source_name}}
Date: {{publication_date}}

Article content:
{{article_body}}

Remember to include the academic citation at the top and follow the WTSP blog post format.`,
      model: "claude-sonnet-4-5-20250514",
      temperature: 0.3,
      maxTokens: 1500,
      active: true,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(5),
    },
    {
      id: "pt_2",
      organizationId: ORG_ID,
      name: "WealthTech Safari (Weekly Roundup)",
      systemPrompt: `You are a professional financial technology content writer for WealthTech Strategy Partners (WTSP). Your task is to create entries for the "WealthTech Safari" weekly roundup format.

Each story in the roundup should have:
- A bold headline summarizing the story
- 2 bullet points with key takeaways
- [KNOTE_PLACEHOLDER] for editorial commentary
- "Click here to read full report" link placeholder`,
      userPromptTemplate: `Create a WealthTech Safari roundup entry for the following article:

Title: {{article_title}}
Source: {{source_name}}
Date: {{publication_date}}

Article content:
{{article_body}}

Format as a WealthTech Safari entry with bold headline, 2 bullet point takeaways, Knote placeholder, and read more link.`,
      model: "claude-sonnet-4-5-20250514",
      temperature: 0.3,
      maxTokens: 1500,
      active: true,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(10),
    },
  ];

  const historyEvents: MockHistoryEvent[] = [
    { id: "evt_1", type: "ingested", contentItemId: "ci_1", title: "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology", stage: "ingestion", status: "completed", channel: null, timestamp: daysAgo(3), details: "Ingested from WealthManagement.com RSS" },
    { id: "evt_2", type: "pipeline_run", contentItemId: "ci_1", title: "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology", stage: "summarization", status: "completed", channel: null, timestamp: daysAgo(3), details: "Summary generated (v1)" },
    { id: "evt_3", type: "approved", contentItemId: "ci_1", title: "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology", stage: "review", status: "completed", channel: null, timestamp: daysAgo(2), details: "Approved by admin" },
    { id: "evt_4", type: "published", contentItemId: "ci_1", title: "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology", stage: "publishing", status: "completed", channel: "Wix Blog", timestamp: daysAgo(2), details: "Published to Wix Blog - WTSP" },
    { id: "evt_5", type: "published", contentItemId: "ci_1", title: "Orion Advisor Solutions Announces Strategic Partnership with Redtail Technology", stage: "publishing", status: "completed", channel: "LinkedIn", timestamp: daysAgo(2), details: "Published to LinkedIn - WTSP" },
    { id: "evt_6", type: "ingested", contentItemId: "ci_7", title: "Riskalyze Officially Rebrands as Nitrogen, Expands Risk Platform", stage: "ingestion", status: "completed", channel: null, timestamp: daysAgo(5), details: "Ingested from Financial Planning Magazine RSS" },
    { id: "evt_7", type: "published", contentItemId: "ci_7", title: "Riskalyze Officially Rebrands as Nitrogen, Expands Risk Platform", stage: "publishing", status: "completed", channel: "Wix Blog", timestamp: daysAgo(5), details: "Published to Wix Blog - WTSP" },
    { id: "evt_8", type: "ingested", contentItemId: "ci_2", title: "Schwab Launches AI-Powered Portfolio Analytics for Independent Advisors", stage: "ingestion", status: "completed", channel: null, timestamp: hoursAgo(4), details: "Ingested from RIABiz RSS" },
    { id: "evt_9", type: "pipeline_run", contentItemId: "ci_2", title: "Schwab Launches AI-Powered Portfolio Analytics for Independent Advisors", stage: "summarization", status: "completed", channel: null, timestamp: hoursAgo(4), details: "Summary generated (v1)" },
    { id: "evt_10", type: "ingested", contentItemId: "ci_3", title: "Envestnet Unveils Next-Generation Data Aggregation Platform", stage: "ingestion", status: "completed", channel: null, timestamp: hoursAgo(2), details: "Ingested from Financial Planning Magazine" },
    { id: "evt_11", type: "pipeline_run", contentItemId: "ci_3", title: "Envestnet Unveils Next-Generation Data Aggregation Platform", stage: "summarization", status: "completed", channel: null, timestamp: hoursAgo(2), details: "Summary generated (v1)" },
    { id: "evt_12", type: "failed", contentItemId: "ci_6", title: "Morgan Stanley Enhances E*TRADE Advisor Dashboard", stage: "summarization", status: "failed", channel: null, timestamp: daysAgo(1), details: "LLM rate limit exceeded during summarization" },
    { id: "evt_13", type: "ingested", contentItemId: "ci_5", title: "FNZ Group Completes Landmark Acquisition of InvestCloud", stage: "ingestion", status: "completed", channel: null, timestamp: hoursAgo(0.5), details: "Manual ingestion" },
    { id: "evt_14", type: "approved", contentItemId: "ci_4", title: "BlackRock Expands Aladdin Wealth to Serve Mid-Market RIAs", stage: "review", status: "completed", channel: null, timestamp: hoursAgo(1), details: "Approved by admin" },
  ];

  return {
    organization,
    sources,
    contentItems,
    summaries,
    publishTargets,
    publishRecords,
    pipelineRuns,
    promptTemplates,
    historyEvents,
    _counter: 100,
  };
}

// ─── Store Singleton ────────────────────────────────────────────────────────

const globalForStore = globalThis as unknown as { __mockStore: MockStore | undefined };

export function getStore(): MockStore {
  if (!globalForStore.__mockStore) {
    globalForStore.__mockStore = createSeedData();
  }
  return globalForStore.__mockStore;
}

// ─── Content Operations ─────────────────────────────────────────────────────

export function getContentItems(filters?: { status?: string; limit?: number; offset?: number }) {
  const store = getStore();
  let items = [...store.contentItems];

  if (filters?.status) {
    items = items.filter((i) => i.status === filters.status);
  }

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = items.length;
  const offset = filters?.offset ?? 0;
  const limit = filters?.limit ?? 50;
  const paged = items.slice(offset, offset + limit);

  // Attach summaries and source info
  const enriched = paged.map((item) => {
    const itemSummaries = store.summaries
      .filter((s) => s.contentItemId === item.id)
      .sort((a, b) => b.version - a.version);
    const source = store.sources.find((s) => s.id === item.sourceId);
    return {
      ...item,
      summaries: itemSummaries,
      generatedImages: [],
      source: source ? { name: source.name, type: source.type } : null,
    };
  });

  return { items: enriched, total, limit, offset };
}

export function getContentItem(id: string) {
  const store = getStore();
  const item = store.contentItems.find((i) => i.id === id);
  if (!item) return null;

  const itemSummaries = store.summaries
    .filter((s) => s.contentItemId === item.id)
    .sort((a, b) => b.version - a.version);
  const source = store.sources.find((s) => s.id === item.sourceId);
  const runs = store.pipelineRuns
    .filter((r) => r.contentItemId === item.id)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  const records = store.publishRecords
    .filter((r) => r.contentItemId === item.id)
    .map((r) => {
      const target = store.publishTargets.find((t) => t.id === r.targetId);
      return { ...r, publishTarget: target ? { name: target.name, type: target.type } : null };
    });

  return {
    ...item,
    summaries: itemSummaries,
    generatedImages: [],
    source,
    pipelineRuns: runs,
    publishRecords: records,
  };
}

export function createContentItem(data: { url: string; organizationId: string; sourceId?: string }) {
  const store = getStore();
  let hostname: string;
  try {
    hostname = new URL(data.url).hostname;
  } catch {
    hostname = "unknown";
  }

  const item: MockContentItem = {
    id: nextId(store),
    organizationId: data.organizationId,
    sourceId: data.sourceId ?? null,
    originalUrl: data.url,
    title: titleFromUrl(data.url),
    author: null,
    publishedDate: null,
    sourceDomain: hostname,
    rawContent: null,
    featuredImage: null,
    status: "ingested",
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.contentItems.push(item);

  store.historyEvents.push({
    id: nextId(store),
    type: "ingested",
    contentItemId: item.id,
    title: item.title || "Untitled",
    stage: "ingestion",
    status: "completed",
    channel: null,
    timestamp: new Date(),
    details: "Manual ingestion via URL",
  });

  return item;
}

export function updateContentItem(id: string, data: { status?: string; knote?: string; title?: string }) {
  const store = getStore();
  const item = store.contentItems.find((i) => i.id === id);
  if (!item) return null;

  if (data.status) {
    item.status = data.status as ContentStatusType;
    item.updatedAt = new Date();

    // Track status-change events
    if (data.status === "approved") {
      store.historyEvents.push({
        id: nextId(store),
        type: "approved",
        contentItemId: item.id,
        title: item.title || "Untitled",
        stage: "review",
        status: "completed",
        channel: null,
        timestamp: new Date(),
        details: "Approved by admin",
      });
    } else if (data.status === "rejected") {
      store.historyEvents.push({
        id: nextId(store),
        type: "rejected",
        contentItemId: item.id,
        title: item.title || "Untitled",
        stage: "review",
        status: "completed",
        channel: null,
        timestamp: new Date(),
        details: "Rejected by admin",
      });
    }
  }

  if (data.title) {
    item.title = data.title;
    item.updatedAt = new Date();
  }

  if (data.knote !== undefined) {
    const summary = store.summaries
      .filter((s) => s.contentItemId === id)
      .sort((a, b) => b.version - a.version)[0];
    if (summary) {
      summary.knote = data.knote;
      summary.updatedAt = new Date();
    }
  }

  return item;
}

export function deleteContentItem(id: string): boolean {
  const store = getStore();
  const idx = store.contentItems.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  store.contentItems.splice(idx, 1);
  store.summaries = store.summaries.filter((s) => s.contentItemId !== id);
  store.pipelineRuns = store.pipelineRuns.filter((r) => r.contentItemId !== id);
  store.publishRecords = store.publishRecords.filter((r) => r.contentItemId !== id);
  return true;
}

// ─── Source Operations ──────────────────────────────────────────────────────

export function getSources() {
  const store = getStore();
  return store.sources.map((s) => ({
    ...s,
    _count: { contentItems: store.contentItems.filter((ci) => ci.sourceId === s.id).length },
  }));
}

export function getSource(id: string) {
  const store = getStore();
  const source = store.sources.find((s) => s.id === id);
  if (!source) return null;
  return {
    ...source,
    _count: { contentItems: store.contentItems.filter((ci) => ci.sourceId === source.id).length },
  };
}

export function createSource(data: { name: string; type: "rss" | "manual"; url: string; organizationId: string; schedule?: string }) {
  const store = getStore();
  const source: MockSource = {
    id: nextId(store),
    organizationId: data.organizationId,
    type: data.type,
    name: data.name,
    url: data.url,
    schedule: data.schedule ?? null,
    active: true,
    lastPolledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.sources.push(source);
  return source;
}

export function updateSource(id: string, data: { name?: string; url?: string; active?: boolean; schedule?: string }) {
  const store = getStore();
  const source = store.sources.find((s) => s.id === id);
  if (!source) return null;
  if (data.name !== undefined) source.name = data.name;
  if (data.url !== undefined) source.url = data.url;
  if (data.active !== undefined) source.active = data.active;
  if (data.schedule !== undefined) source.schedule = data.schedule;
  source.updatedAt = new Date();
  return source;
}

export function deleteSource(id: string): boolean {
  const store = getStore();
  const idx = store.sources.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.sources.splice(idx, 1);
  return true;
}

// ─── Publishing Operations ──────────────────────────────────────────────────

export function getPublishTargets() {
  const store = getStore();
  return store.publishTargets.map((t) => ({
    ...t,
    _count: { publishRecords: store.publishRecords.filter((r) => r.targetId === t.id).length },
    lastPublished: store.publishRecords
      .filter((r) => r.targetId === t.id && r.status === "published")
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))[0]?.publishedAt ?? null,
  }));
}

export function updatePublishTarget(id: string, data: { connected?: boolean; active?: boolean; name?: string; settings?: Record<string, unknown> }) {
  const store = getStore();
  const target = store.publishTargets.find((t) => t.id === id);
  if (!target) return null;
  if (data.connected !== undefined) target.connected = data.connected;
  if (data.active !== undefined) target.active = data.active;
  if (data.name !== undefined) target.name = data.name;
  if (data.settings !== undefined) target.settings = data.settings;
  target.updatedAt = new Date();
  return target;
}

export function publishContent(contentItemId: string, targetId: string) {
  const store = getStore();
  const item = store.contentItems.find((i) => i.id === contentItemId);
  const target = store.publishTargets.find((t) => t.id === targetId);
  if (!item || !target) return null;

  const record: MockPublishRecord = {
    id: nextId(store),
    contentItemId,
    targetId,
    externalId: `${target.type}-post-${Date.now()}`,
    status: "published",
    publishedAt: new Date(),
    errorMessage: null,
    attempts: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.publishRecords.push(record);

  item.status = "published";
  item.updatedAt = new Date();

  store.historyEvents.push({
    id: nextId(store),
    type: "published",
    contentItemId: item.id,
    title: item.title || "Untitled",
    stage: "publishing",
    status: "completed",
    channel: target.name,
    timestamp: new Date(),
    details: `Published to ${target.name}`,
  });

  return record;
}

// ─── Pipeline Operations ────────────────────────────────────────────────────

export function getPipelineRuns(contentItemId: string) {
  const store = getStore();
  return store.pipelineRuns
    .filter((r) => r.contentItemId === contentItemId)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

function generateMockSummary(title: string, url: string): string {
  const domain = (() => { try { return new URL(url).hostname; } catch { return "unknown.com"; } })();
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const displayTitle = title || "Untitled Article";

  return `Author, A. (${date}). "${displayTitle}." ${domain}.

This article discusses recent developments in the financial technology sector that could have significant implications for wealth management professionals and their clients. The report highlights key strategic moves and technology innovations that are reshaping how advisors deliver services and manage client portfolios.

Industry observers note that these developments reflect broader trends toward digitization, automation, and data-driven decision making in wealth management. The potential benefits for both advisors and end investors include improved efficiency, enhanced client experience, and more sophisticated portfolio management capabilities.

Source: ${url}`;
}

export function executeMockPipeline(contentItemId: string): { success: boolean; error?: string } {
  const store = getStore();
  const item = store.contentItems.find((i) => i.id === contentItemId);
  if (!item) return { success: false, error: "Content item not found" };

  if (item.status !== "ingested" && item.status !== "failed") {
    return { success: false, error: `Cannot run pipeline on item with status '${item.status}'` };
  }

  const now = new Date();

  // Create pipeline run
  const run: MockPipelineRun = {
    id: nextId(store),
    contentItemId,
    stages: [],
    currentStage: "summarization",
    startedAt: now,
    completedAt: null,
    errors: [],
  };

  // Stage: summarization
  item.status = "summarizing";
  run.stages.push({
    stage: "summarization",
    success: true,
    startedAt: now.toISOString(),
    completedAt: new Date().toISOString(),
  });

  const summary: MockSummary = {
    id: nextId(store),
    contentItemId,
    promptTemplateId: "pt_1",
    modelUsed: "claude-sonnet-4-5-20250514 (mock)",
    body: generateMockSummary(item.title || "", item.originalUrl),
    knote: null,
    version: store.summaries.filter((s) => s.contentItemId === contentItemId).length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.summaries.push(summary);
  item.status = "summarized";

  // Stage: image generation
  run.stages.push({
    stage: "image_generation",
    success: true,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
  item.status = "generating_image";

  // Complete pipeline - ready for review
  item.status = "ready_for_review";
  item.updatedAt = new Date();
  run.currentStage = null;
  run.completedAt = new Date();
  store.pipelineRuns.push(run);

  store.historyEvents.push({
    id: nextId(store),
    type: "pipeline_run",
    contentItemId: item.id,
    title: item.title || "Untitled",
    stage: "summarization",
    status: "completed",
    channel: null,
    timestamp: new Date(),
    details: `Pipeline completed. Summary generated (v${summary.version}).`,
  });

  return { success: true };
}

// ─── Dashboard Operations ───────────────────────────────────────────────────

export function getDashboardStats() {
  const store = getStore();
  const items = store.contentItems;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queueCount = items.filter((i) =>
    ["ingested", "summarizing", "summarized", "generating_image", "ready_for_review"].includes(i.status)
  ).length;

  const publishedToday = store.publishRecords.filter(
    (r) => r.status === "published" && r.publishedAt && r.publishedAt >= today
  ).length;

  const failedCount = items.filter((i) => i.status === "failed").length;

  const sourceCount = store.sources.filter((s) => s.active).length;

  return { queueCount, publishedToday, failedCount, sourceCount };
}

export function getRecentActivity(limit = 10) {
  const store = getStore();
  return store.historyEvents
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getPipelineOverview() {
  const store = getStore();
  const items = store.contentItems;
  return {
    ingested: items.filter((i) => i.status === "ingested").length,
    summarizing: items.filter((i) => ["summarizing", "summarized", "generating_image"].includes(i.status)).length,
    readyForReview: items.filter((i) => i.status === "ready_for_review").length,
    approved: items.filter((i) => i.status === "approved").length,
    published: items.filter((i) => i.status === "published").length,
    failed: items.filter((i) => i.status === "failed").length,
  };
}

// ─── Settings Operations ────────────────────────────────────────────────────

export function getSettings() {
  const store = getStore();
  return {
    organization: store.organization,
    promptTemplates: store.promptTemplates,
  };
}

export function updateSettings(data: {
  ai?: { model?: string; temperature?: number; maxTokens?: number };
  branding?: { primaryColor?: string; secondaryColor?: string; logoUrl?: string; name?: string };
  promptTemplate?: { id: string; systemPrompt?: string; userPromptTemplate?: string };
}) {
  const store = getStore();

  if (data.ai) {
    if (data.ai.model !== undefined) store.organization.settings.ai.model = data.ai.model;
    if (data.ai.temperature !== undefined) store.organization.settings.ai.temperature = data.ai.temperature;
    if (data.ai.maxTokens !== undefined) store.organization.settings.ai.maxTokens = data.ai.maxTokens;
  }

  if (data.branding) {
    if (data.branding.primaryColor !== undefined) store.organization.branding.primaryColor = data.branding.primaryColor;
    if (data.branding.secondaryColor !== undefined) store.organization.branding.secondaryColor = data.branding.secondaryColor;
    if (data.branding.logoUrl !== undefined) store.organization.branding.logoUrl = data.branding.logoUrl;
    if (data.branding.name !== undefined) store.organization.name = data.branding.name;
  }

  if (data.promptTemplate) {
    const pt = store.promptTemplates.find((t) => t.id === data.promptTemplate!.id);
    if (pt) {
      if (data.promptTemplate.systemPrompt !== undefined) pt.systemPrompt = data.promptTemplate.systemPrompt;
      if (data.promptTemplate.userPromptTemplate !== undefined) pt.userPromptTemplate = data.promptTemplate.userPromptTemplate;
      pt.updatedAt = new Date();
    }
  }

  store.organization.updatedAt = new Date();
  return getSettings();
}

// ─── History Operations ─────────────────────────────────────────────────────

export function getHistoryEvents(filters?: { type?: string; search?: string; days?: number }) {
  const store = getStore();
  let events = [...store.historyEvents];

  if (filters?.type && filters.type !== "all") {
    events = events.filter((e) => e.type === filters.type);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.contentItemId.toLowerCase().includes(q) ||
        (e.details && e.details.toLowerCase().includes(q))
    );
  }

  if (filters?.days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filters.days);
    events = events.filter((e) => e.timestamp >= cutoff);
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
