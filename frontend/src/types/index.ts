export type VerdictType = 
  | 'SUPPORTED' 
  | 'CONTRADICTED' 
  | 'INSUFFICIENT EVIDENCE' 
  | 'CONTEXT DEPENDENT' 
  | 'POTENTIALLY RISKY';

export type CategoryType = 
  | 'General Assumption' 
  | 'Fact Check' 
  | 'Personal Decision' 
  | 'Logical Fallacy' 
  | 'Risk Analysis';

export interface FactOpinionItem {
  statement: string;
  type: 'fact' | 'assumption' | 'opinion' | 'prediction';
  assessment: string;
}

export interface EvidenceItem {
  title: string;
  snippet: string;
  source_url?: string;
  credibility?: string;
}

export interface ConfidenceMetric {
  rating: string;
  score: number;
  basis: string;
}

export interface AnalysisResponse {
  id?: number;
  original_input: string;
  category: CategoryType;
  summary: string;
  main_claim: string;
  detected_assumptions: string[];
  facts_and_opinions: FactOpinionItem[];
  logical_issues: string[];
  verdict: VerdictType;
  verdict_explanation: string;
  confidence: ConfidenceMetric;
  supporting_evidence: EvidenceItem[];
  missing_information: string[];
  potential_advantages: string[];
  potential_risks: string[];
  recommended_next_step: string;
  alternative_approach: string;
  limitations_and_uncertainty: string;
  follow_up_questions: string[];
  is_demo_mode: boolean;
  created_at?: string;
}

export interface HistoryItem {
  id: number;
  original_input: string;
  summary: string;
  category: CategoryType;
  verdict: VerdictType;
  created_at: string;
}

export interface FollowUpResponse {
  id?: number;
  analysis_id: number;
  question: string;
  answer: string;
  suggested_perspectives: string[];
  created_at: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  openai_configured: boolean;
  openai_model: string;
  demo_mode: boolean;
  database: string;
}
