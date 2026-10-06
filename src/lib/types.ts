export type DetectionStatus =
  | "detected"
  | "not_detected"
  | "likely"
  | "could_not_verify";

export type SignalCheck = {
  id: string;
  label: string;
  status: DetectionStatus;
  evidence: string;
};

export type DealerSignals = {
  leadCapture: SignalCheck[];
  inventory: SignalCheck[];
  conversion: SignalCheck[];
  aiReadiness: SignalCheck[];
  technical: SignalCheck[];
};

export type ScoreCategory = {
  key: "leadCapture" | "inventory" | "conversion" | "aiReadiness";
  label: string;
  score: number;
  max: number;
};

export type ScoreBreakdown = {
  categories: ScoreCategory[];
  overall: number;
  label: "Needs Attention" | "Developing" | "Strong" | "Advanced";
  summary: string;
};

export type Opportunity = {
  title: string;
  category: string;
  severity: "High" | "Medium" | "Low";
  evidence: string;
  whyItMatters: string;
  recommendedAction: string;
  spyneProduct: "Vini AI" | "Studio AI" | null;
};

export type SpyneRecommendation = {
  product: "Vini AI" | "Studio AI";
  tagline: string;
  opportunity: string;
  relevant: boolean;
};

export type ScrapedImage = {
  src: string;
  alt: string;
};

export type ScrapedPage = {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
  links: string[];
  buttons: string[];
  formCount: number;
  phones: string[];
  emails: string[];
  images: ScrapedImage[];
  hasViewportMeta: boolean;
  isHttps: boolean;
  htmlLower: string;
};

export type ScrapeResult = {
  ok: boolean;
  homepageUrl: string;
  pages: ScrapedPage[];
  error?: string;
  blocked?: boolean;
};

export type AnalysisResult = {
  url: string;
  analyzedAt: string;
  mode: "live" | "sample";
  scrapeWarning?: string;
  scores: ScoreBreakdown;
  signals: DealerSignals;
  opportunities: Opportunity[];
  quickWins: string[];
  spyne: SpyneRecommendation[];
  pagesAnalyzed: { url: string; title: string }[];
};

export type AnalyzeApiSuccess = {
  ok: true;
  result: AnalysisResult;
};

export type AnalyzeApiFailure = {
  ok: false;
  error: string;
  suggestSample: boolean;
};

export type AnalyzeApiResponse = AnalyzeApiSuccess | AnalyzeApiFailure;
