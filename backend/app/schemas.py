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

class ConfidenceMetric(BaseModel):
    rating: str = Field(description="High / Moderate / Low evidence or reasoning strength")
    score: int = Field(ge=0, le=100, description="Quantitative reasoning firmness index")
    basis: str = Field(description="Clear explanation of how this confidence score was derived")

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
    suggested_perspectives: List[str] = []
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
    supporting_evidence: List[EvidenceItem] = []
    missing_information: List[str] = []
    potential_advantages: List[str] = []
    potential_risks: List[str] = []
    recommended_next_step: str
    alternative_approach: str
    limitations_and_uncertainty: str
    follow_up_questions: List[str] = []
    is_demo_mode: bool = False
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
