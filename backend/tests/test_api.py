import pytest
import sqlite3
import os
import json
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import init_db
from app.schemas import AnalysisRequest, CategoryEnum, VerdictEnum
from app.services.ai_service import ai_service
from app.config import settings

@pytest.fixture(autouse=True)
def setup_db():
    import asyncio
    asyncio.run(init_db())

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "demo_mode" in data
        assert "database" in data

@pytest.mark.asyncio
async def test_analyze_empty_or_invalid_request():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Too short input (less than 5 chars)
        response = await client.post("/api/analyze", json={"text": "hey", "category": "General Assumption"})
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_analyze_supported_verdict():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze", json={
            "text": "Regular cardiovascular exercise improves cardiovascular health and stamina.",
            "category": "Fact Check"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["verdict"] == "SUPPORTED"
        assert len(data["detected_assumptions"]) > 0
        assert "confidence" in data
        assert data["confidence"]["score"] >= 80

@pytest.mark.asyncio
async def test_analyze_contradicted_verdict():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze", json={
            "text": "The earth is flat and scientific satellite images are all fabricated.",
            "category": "Fact Check"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["verdict"] == "CONTRADICTED"
        assert any("Conspiracy" in item or "Consensus" in item for item in data["logical_issues"])

@pytest.mark.asyncio
async def test_analyze_potentially_risky_verdict():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze", json={
            "text": "I should quit my university degree and put all my savings into an unverified crypto scheme to get fast money.",
            "category": "Risk Analysis"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["verdict"] == "POTENTIALLY RISKY"
        assert len(data["potential_risks"]) > 0

@pytest.mark.asyncio
async def test_analyze_insufficient_evidence_verdict():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze", json={
            "text": "Product X will succeed soon.",
            "category": "General Assumption"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["verdict"] == "INSUFFICIENT EVIDENCE"
        assert len(data["missing_information"]) > 0

@pytest.mark.asyncio
async def test_analyze_context_dependent_verdict():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze", json={
            "text": "Remote work is always superior to working in an office for every organization.",
            "category": "General Assumption"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["verdict"] == "CONTEXT DEPENDENT"
        assert len(data["potential_advantages"]) > 0

@pytest.mark.asyncio
async def test_history_and_follow_up_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create an analysis record
        create_res = await client.post("/api/analyze", json={
            "text": "Starting a boutique coffee shop in my hometown is guaranteed to be profitable.",
            "category": "Personal Decision"
        })
        assert create_res.status_code == 201
        record = create_res.json()
        record_id = record["id"]
        assert record_id is not None

        # Fetch history list
        hist_res = await client.get("/api/history")
        assert hist_res.status_code == 200
        items = hist_res.json()
        assert any(item["id"] == record_id for item in items)

        # Fetch record detail
        detail_res = await client.get(f"/api/history/{record_id}")
        assert detail_res.status_code == 200
        detail_data = detail_res.json()
        assert detail_data["id"] == record_id
        assert detail_data["main_claim"] != ""

        # Post follow-up question
        follow_res = await client.post("/api/follow-up", json={
            "analysis_id": record_id,
            "question": "What is the biggest operational risk if foot traffic drops during winter?"
        })
        assert follow_res.status_code == 200
        follow_data = follow_res.json()
        assert follow_data["analysis_id"] == record_id
        assert len(follow_data["answer"]) > 10

        # Delete single history item
        del_res = await client.delete(f"/api/history/{record_id}")
        assert del_res.status_code == 200

        # Verify it's deleted
        verify_res = await client.get(f"/api/history/{record_id}")
        assert verify_res.status_code == 404

@pytest.mark.asyncio
async def test_openai_mock_success():
    """Verifies that when a live OpenAI client returns structured JSON, it parses cleanly."""
    mock_client = MagicMock()
    mock_completion = MagicMock()
    mock_completion.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps({
                    "summary": "Mocked live LLM analysis summary.",
                    "main_claim": "Solar energy is becoming increasingly cost-effective.",
                    "detected_assumptions": ["Assumes battery storage tech continues scaling."],
                    "facts_and_opinions": [
                        {"statement": "Solar costs dropped over past decade", "type": "fact", "assessment": "Empirically documented"}
                    ],
                    "logical_issues": ["No notable logical fallacies detected."],
                    "verdict": "SUPPORTED",
                    "verdict_explanation": "Extensive industrial production data supports the cost reduction trend.",
                    "confidence": {
                        "rating": "High",
                        "score": 90,
                        "basis": "Corroborated by global energy market reports."
                    },
                    "missing_information": ["Regional grid storage infrastructure."],
                    "potential_advantages": ["Lower operational expenditure."],
                    "potential_risks": ["Intermittency during peak night hours."],
                    "recommended_next_step": "Perform localized solar irradiance study.",
                    "alternative_approach": "Hybrid wind-solar microgrid.",
                    "limitations_and_uncertainty": "Commodity pricing fluctuations.",
                    "follow_up_questions": ["What is the payback horizon in this jurisdiction?"]
                })
            )
        )
    ]
    mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)

    req = AnalysisRequest(
        text="Solar energy is becoming increasingly cost-effective worldwide.",
        category=CategoryEnum.FACT_CHECK
    )
    res = await ai_service._analyze_with_openai(req, [], client=mock_client)
    assert res.verdict == VerdictEnum.SUPPORTED
    assert res.confidence.score == 90
    assert res.is_demo_mode is False
    assert res.main_claim == "Solar energy is becoming increasingly cost-effective."

@pytest.mark.asyncio
async def test_openai_error_fallback_handling():
    """Verifies that an OpenAI network/auth failure gracefully falls back to the heuristic engine."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(side_effect=RuntimeError("Rate limit / Auth error"))

    req = AnalysisRequest(
        text="Starting an AI SaaS without coding experience is guaranteed to succeed.",
        category=CategoryEnum.RISK_ANALYSIS
    )
    
    # Save original _get_client
    orig_get_client = ai_service._get_client
    ai_service._get_client = lambda: mock_client
    try:
        res = await ai_service.analyze(req)
        # Verify fallback occurred gracefully
        assert res.verdict in [VerdictEnum.POTENTIALLY_RISKY, VerdictEnum.CONTEXT_DEPENDENT]
        assert "fallback analytical engine" in res.limitations_and_uncertainty
    finally:
        ai_service._get_client = orig_get_client

@pytest.mark.asyncio
async def test_clear_all_history_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create 2 records
        await client.post("/api/analyze", json={"text": "Test statement 1 for clear all", "category": "General Assumption"})
        await client.post("/api/analyze", json={"text": "Test statement 2 for clear all", "category": "General Assumption"})
        
        # Verify history has items
        hist = await client.get("/api/history")
        assert len(hist.json()) >= 2
        
        # Clear all
        clear_res = await client.delete("/api/history")
        assert clear_res.status_code == 200
        
        # Verify history is now empty
        empty_hist = await client.get("/api/history")
        assert len(empty_hist.json()) == 0

def test_sqlite_physical_file_persistence():
    """Directly queries SQLite to ensure tables exist and schema matches expectations."""
    db_path = "./assumption_check.db"
    assert os.path.exists(db_path), "assumption_check.db file should physically exist on disk"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    assert "analysis_records" in tables, "Table 'analysis_records' must exist in SQLite database"
    assert "follow_up_records" in tables, "Table 'follow_up_records' must exist in SQLite database"
