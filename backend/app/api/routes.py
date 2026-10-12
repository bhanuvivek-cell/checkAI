import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from app.database import get_db
from app.models import AnalysisRecord, FollowUpRecord
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    HealthResponse,
    FollowUpRequest,
    FollowUpResponse,
    AnalysisHistoryItem,
    VerdictEnum,
    CategoryEnum,
    ConfidenceMetric,
    EvidenceItem,
    FactOpinionItem
)
from app.services.ai_service import ai_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint providing system status and AI provider information."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        openai_configured=bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip()),
        openai_model=settings.OPENAI_MODEL,
        demo_mode=settings.is_demo_mode,
        database="SQLite (PostgreSQL Compatible via SQLAlchemy)"
    )

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_input(
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Main analysis endpoint. Evaluates input, identifies assumptions, calculates verdict,
    and persists record into the SQLite/PostgreSQL database.
    """
    try:
        # 1. Run AI analysis service
        analysis_result = await ai_service.analyze(request)
        
        # 2. Persist to database
        record = AnalysisRecord(
            original_input=analysis_result.original_input,
            category=analysis_result.category,
            summary=analysis_result.summary,
            main_claim=analysis_result.main_claim,
            verdict=analysis_result.verdict.value,
            verdict_explanation=analysis_result.verdict_explanation,
            detected_assumptions=analysis_result.detected_assumptions,
            facts_and_opinions=[fo.model_dump() for fo in analysis_result.facts_and_opinions],
            logical_issues=analysis_result.logical_issues,
            confidence=analysis_result.confidence.model_dump(),
            supporting_evidence=[se.model_dump() for se in analysis_result.supporting_evidence],
            missing_information=analysis_result.missing_information,
            potential_advantages=analysis_result.potential_advantages,
            potential_risks=analysis_result.potential_risks,
            recommended_next_step=analysis_result.recommended_next_step,
            alternative_approach=analysis_result.alternative_approach,
            limitations_and_uncertainty=analysis_result.limitations_and_uncertainty,
            follow_up_questions=analysis_result.follow_up_questions,
            is_demo_mode=analysis_result.is_demo_mode
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        # Attach persisted database ID and timestamp
        analysis_result.id = record.id
        analysis_result.created_at = record.created_at
        return analysis_result

    except Exception as e:
        logger.error(f"Error during analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine error: {str(e)}"
        )

@router.get("/history", response_model=List[AnalysisHistoryItem])
async def get_history(
    category: Optional[str] = Query(None, description="Filter by category"),
    verdict: Optional[str] = Query(None, description="Filter by verdict"),
    search: Optional[str] = Query(None, description="Search term in input/summary"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves saved analyses history with optional filtering."""
    query = select(AnalysisRecord).order_by(desc(AnalysisRecord.created_at))

    if category:
        query = query.where(AnalysisRecord.category == category)
    if verdict:
        query = query.where(AnalysisRecord.verdict == verdict)
    if search:
        query = query.where(
            AnalysisRecord.original_input.ilike(f"%{search}%") | 
            AnalysisRecord.summary.ilike(f"%{search}%")
        )

    query = query.limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()

    return [
        AnalysisHistoryItem(
            id=r.id,
            original_input=r.original_input,
            summary=r.summary,
            category=r.category,
            verdict=VerdictEnum(r.verdict),
            created_at=r.created_at
        )
        for r in records
    ]

@router.get("/history/{record_id}", response_model=AnalysisResponse)
async def get_history_detail(
    record_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves full detail of a specific analysis record."""
    result = await db.execute(select(AnalysisRecord).where(AnalysisRecord.id == record_id))
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID {record_id} not found."
        )

    # Reconstruct nested schemas
    facts_opinions = [FactOpinionItem(**fo) for fo in (record.facts_and_opinions or [])]
    evidence = [EvidenceItem(**se) for se in (record.supporting_evidence or [])]
    conf_data = record.confidence or {}
    confidence = ConfidenceMetric(
        rating=conf_data.get("rating", "Moderate"),
        score=conf_data.get("score", 70),
        basis=conf_data.get("basis", "Assessed by standard critical evaluation.")
    )

    return AnalysisResponse(
        id=record.id,
        original_input=record.original_input,
        category=record.category,
        summary=record.summary,
        main_claim=record.main_claim,
        detected_assumptions=record.detected_assumptions or [],
        facts_and_opinions=facts_opinions,
        logical_issues=record.logical_issues or [],
        verdict=VerdictEnum(record.verdict),
        verdict_explanation=record.verdict_explanation,
        confidence=confidence,
        supporting_evidence=evidence,
        missing_information=record.missing_information or [],
        potential_advantages=record.potential_advantages or [],
        potential_risks=record.potential_risks or [],
        recommended_next_step=record.recommended_next_step,
        alternative_approach=record.alternative_approach,
        limitations_and_uncertainty=record.limitations_and_uncertainty,
        follow_up_questions=record.follow_up_questions or [],
        is_demo_mode=record.is_demo_mode,
        created_at=record.created_at
    )

@router.delete("/history/{record_id}", status_code=status.HTTP_200_OK)
async def delete_history_item(
    record_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Deletes a specific analysis record by ID."""
    result = await db.execute(select(AnalysisRecord).where(AnalysisRecord.id == record_id))
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID {record_id} not found."
        )

    await db.delete(record)
    await db.commit()
    return {"message": f"Analysis {record_id} deleted successfully."}

@router.delete("/history", status_code=status.HTTP_200_OK)
async def clear_all_history(
    db: AsyncSession = Depends(get_db)
):
    """Clears all analysis history from the database."""
    await db.execute(delete(FollowUpRecord))
    await db.execute(delete(AnalysisRecord))
    await db.commit()
    return {"message": "All analysis history successfully cleared."}

@router.post("/follow-up", response_model=FollowUpResponse)
async def ask_follow_up(
    request: FollowUpRequest,
    db: AsyncSession = Depends(get_db)
):
    """Allows asking a follow-up question regarding a previously completed analysis."""
    result = await db.execute(select(AnalysisRecord).where(AnalysisRecord.id == request.analysis_id))
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Referenced analysis with ID {request.analysis_id} does not exist."
        )

    # Process follow-up inquiry with AI service
    response = await ai_service.answer_follow_up(
        request=request,
        analysis_summary=record.summary,
        main_claim=record.main_claim,
        verdict=record.verdict
    )

    # Persist follow-up in DB
    follow_up_rec = FollowUpRecord(
        analysis_id=record.id,
        question=request.question,
        answer=response.answer,
        suggested_perspectives=response.suggested_perspectives
    )
    db.add(follow_up_rec)
    await db.commit()
    await db.refresh(follow_up_rec)

    response.id = follow_up_rec.id
    return response
