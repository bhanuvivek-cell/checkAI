from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class VerdictEnum(str, Enum):
    SUPPORTED = "SUPPORTED"
    CONTRADICTED = "CONTRADICTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT EVIDENCE"
    CONTEXT_DEPENDENT = "CONTEXT DEPENDENT"
    POTENTIALLY_RISKY = "POTENTIALLY RISKY"

class CategoryEnum(str, Enum):
    GENERAL_ASSUMPTION = "General Assumption"
    FACT_CHECK = "Fact Check"
    PERSONAL_DECISION = "Personal Decision"
    LOGICAL_FALLACY = "Logical Fallacy"
    RISK_ANALYSIS = "Risk Analysis"

class FactOpinionItem(BaseModel):
    statement: str
    type: str = Field(description="'fact', 'assumption', 'opinion', or 'prediction'")
    assessment: str

class EvidenceItem(BaseModel):
    title: str
    snippet: str
    source_url: Optional[str] = None
    credibility: Optional[str] = "Verified Domain / Credible Reference"

class ConfidenceComponent(BaseModel):
    empirical_verifiability: int = Field(default=15, ge=0, le=25, description="Testability against empirical data or scientific consensus (0-25)")
    logical_validity: int = Field(default=18, ge=0, le=25, description="Coherence of reasoning and absence of fallacies (0-25)")
    contextual_completeness: int = Field(default=15, ge=0, le=25, description="Degree to which boundary conditions and parameters are defined (0-25)")
    epistemic_humility: int = Field(default=15, ge=0, le=25, description="Calibration of claims avoiding unhedged absolutes (0-25)")

class ConfidenceMetric(BaseModel):
    rating: str = Field(description="High / Moderate / Low evidence or reasoning strength")
    score: int = Field(ge=0, le=100, description="Quantitative reasoning firmness index (sum of component scores)")
    basis: str = Field(description="Clear explanation of how this confidence score was derived")
    components: Optional[ConfidenceComponent] = None
    limitations: Optional[str] = Field(
        default="Estimated using a 4-pillar analytical rubric; reflects argumentative rigor, not an absolute proof.",
        description="Limitations and disclaimer of the score"
    )

class EvidenceVerificationBreakdown(BaseModel):
    established_facts: List[str] = Field(default_factory=list, description="Objectively verifiable or consensus facts")
    user_provided_claims: List[str] = Field(default_factory=list, description="Premises asserted directly by the user input")
    logical_inferences: List[str] = Field(default_factory=list, description="Deductions or inferences that follow from premises")
    unverified_claims: List[str] = Field(default_factory=list, description="Assertions that require external empirical testing")

class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=5000, description="The statement, claim, plan, or decision to analyze")
    category: CategoryEnum = Field(default=CategoryEnum.GENERAL_ASSUMPTION, description="Analytical framework category")
    search_enabled: bool = Field(default=True, description="Whether to invoke evidence retrieval if configured")

class FollowUpRequest(BaseModel):
    analysis_id: int = Field(..., description="ID of the previous analysis record")
    question: str = Field(..., min_length=3, max_length=1500, description="User's follow-up inquiry")

class FollowUpResponse(BaseModel):
    id: Optional[int] = None
    analysis_id: int
    question: str
    answer: str
    suggested_perspectives: List[str] = Field(default_factory=list)
    created_at: datetime

class AnalysisResponse(BaseModel):
    id: Optional[int] = None
    original_input: str
    category: str
    summary: str
    main_claim: str
    detected_assumptions: List[str]
    facts_and_opinions: List[FactOpinionItem]
    logical_issues: List[str]
    verdict: VerdictEnum
    verdict_explanation: str
    confidence: ConfidenceMetric
    counterarguments: List[str] = Field(default_factory=list, description="Alternative explanations and contradictory considerations")
    evidence_verification: Optional[EvidenceVerificationBreakdown] = None
    supporting_evidence: List[EvidenceItem] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    potential_advantages: List[str] = Field(default_factory=list)
    potential_risks: List[str] = Field(default_factory=list)
    recommended_next_step: str
    alternative_approach: str
    calibrated_alternative: Optional[str] = None
    limitations_and_uncertainty: str
    follow_up_questions: List[str] = Field(default_factory=list)
    is_demo_mode: bool = False
    engine_used: str = Field(default="heuristic_fallback", description="'openai_live' or 'heuristic_fallback'")
    api_status: Optional[str] = Field(default=None, description="e.g. 'live_success', 'quota_exceeded', 'rate_limited', 'auth_error', 'not_configured'")
    api_error_message: Optional[str] = None
    created_at: Optional[datetime] = None

class AnalysisHistoryItem(BaseModel):
    id: int
    original_input: str
    summary: str
    category: str
    verdict: VerdictEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HealthResponse(BaseModel):
    status: str
    version: str
    openai_configured: bool
    openai_model: str
    demo_mode: bool
    database: str
    api_status: str = Field(default="demo_mode", description="'active', 'quota_exceeded', 'auth_error', 'not_configured', 'demo_mode'")
    api_status_message: str = ""
