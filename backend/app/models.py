from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    original_input = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    main_claim = Column(Text, nullable=False)
    verdict = Column(String(50), nullable=False, index=True)
    verdict_explanation = Column(Text, nullable=False)
    
    # Complex fields stored as JSON
    detected_assumptions = Column(JSON, nullable=False, default=list)
    facts_and_opinions = Column(JSON, nullable=False, default=list)
    logical_issues = Column(JSON, nullable=False, default=list)
    confidence = Column(JSON, nullable=False, default=dict)
    counterarguments = Column(JSON, nullable=True, default=list)
    evidence_verification = Column(JSON, nullable=True, default=dict)
    supporting_evidence = Column(JSON, nullable=False, default=list)
    missing_information = Column(JSON, nullable=False, default=list)
    potential_advantages = Column(JSON, nullable=False, default=list)
    potential_risks = Column(JSON, nullable=False, default=list)
    
    recommended_next_step = Column(Text, nullable=False)
    alternative_approach = Column(Text, nullable=False)
    calibrated_alternative = Column(Text, nullable=True)
    limitations_and_uncertainty = Column(Text, nullable=False)
    follow_up_questions = Column(JSON, nullable=False, default=list)
    is_demo_mode = Column(Boolean, default=False)
    engine_used = Column(String(50), nullable=True, default="heuristic_fallback")
    api_status = Column(String(50), nullable=True)
    api_error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    follow_ups = relationship("FollowUpRecord", back_populates="analysis", cascade="all, delete-orphan")

class FollowUpRecord(Base):
    __tablename__ = "follow_up_records"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_records.id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    suggested_perspectives = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("AnalysisRecord", back_populates="follow_ups")
