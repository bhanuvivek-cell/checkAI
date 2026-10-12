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

export interface ConfidenceComponent {
  empirical_verifiability: number;
  logical_validity: number;
  contextual_completeness: number;
  epistemic_humility: number;
}

export interface ConfidenceMetric {
  rating: string;
  score: number;
  basis: string;
  components?: ConfidenceComponent;
  limitations?: string;
}

export interface EvidenceVerificationBreakdown {
  established_facts: string[];
  user_provided_claims: string[];
  logical_inferences: string[];
  unverified_claims: string[];
}

export interface AnalysisResponse {
  id?: number;
  original_input: string;
  category: CategoryType;
  summary: string;
  main_claim: string;
  detected_assumptions: string[];
  evidence_verification?: EvidenceVerificationBreakdown;
  facts_and_opinions: FactOpinionItem[];
  counterarguments?: string[];
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
  calibrated_alternative?: string;
  limitations_and_uncertainty: string;
  follow_up_questions: string[];
  is_demo_mode: boolean;
  engine_used?: 'openai_live' | 'heuristic_fallback' | string;
  api_status?: string;
  api_error_message?: string;
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
  api_status?: string;
  api_status_message?: string;
}
