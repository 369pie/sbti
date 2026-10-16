/**
 * 命书馆数据类型 — 与 prompt.ts 输出 JSON 形状对齐
 */

export interface DestinyChart {
  fourPillars: string;
  dayMaster: string;
  monthlyOrder: string;
  structure: string;
  regulator: string;
  trueSolarTimeNote: string;
}

export interface DestinyPrediction {
  ageRange: string;
  claim: string;
  confidence: '高' | '中' | '低' | string;
  source: string;
}

export interface DestinyBlindReading {
  summary: string;
  predictions: DestinyPrediction[];
}

export interface DestinyValidation {
  matchedEvents: { userEvent: string; chartSupports: string }[];
  conflicts: { userEvent: string; issue: string }[];
  confidenceScore: string | number;
}

export interface DestinyDomainCard {
  claim: string;
  votes: string;             // "3/4" 共识
  voters?: string[];
  minority?: string;
  source: string;
}

export interface DestinyCurrentReading {
  career: DestinyDomainCard;
  wealth: DestinyDomainCard;
  relationship: DestinyDomainCard;
  health: DestinyDomainCard;
}

export interface DestinyKeyYear {
  year: number;
  age?: number;
  rating: '高危' | '平稳' | '利好' | string;
  reason: string;
  source: string;
}

export interface DestinyFutureFlow {
  currentLuckCycle: string;
  keyYears: DestinyKeyYear[];
  monthlyHighRisk?: { yearMonth: string; warning: string; source: string }[];
}

export interface DestinyReport {
  chart: DestinyChart;
  blindReading: DestinyBlindReading;
  validation: DestinyValidation;
  currentReading: DestinyCurrentReading;
  futureFlow: DestinyFutureFlow;
  uncertainties: string[];
  disclaimer: string;
  /** 服务端附加 */
  meta?: {
    promptVersion: string;
    generatedAt: number;
    stub?: boolean;
    evidenceMode?: 'stub' | 'model_cited';
    reviewStatus?: 'unreviewed' | 'advisor_reviewed';
  };
}

export interface DestinyApiResponse {
  ok: boolean;
  report?: DestinyReport;
  error?: string;
  stub?: boolean;
}
