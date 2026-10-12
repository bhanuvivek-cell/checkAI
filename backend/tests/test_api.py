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

@pytest.mark.asyncio
async def test_student_10_hours_study_test_case():
    """
    Test Case 10 from Specification:
    Input: 'Students who study for 10 hours every day always get the highest marks.'
    Expected:
    - Identifies absolute generalization ('always')
    - Explains that study time alone does not guarantee highest marks (quality, sleep, diminishing returns)
    - Recommends testing with academic data
    - Avoids generic business risks or irrelevant filler
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze", json={
            "text": "Students who study for 10 hours every day always get the highest marks.",
            "category": "General Assumption"
        })
        assert response.status_code == 201
        data = response.json()

        # 1. Verdict check
        assert data["verdict"] in ["CONTEXT DEPENDENT", "INSUFFICIENT EVIDENCE"]

        # 2. Key academic concepts identified
        explanation_lower = data["verdict_explanation"].lower()
        assert any(term in explanation_lower for term in ["diminishing returns", "fatigue", "technique", "deliberate", "sleep", "quality"])

        # 3. Absolute generalization scrutinization
        assert any("always" in term.lower() or "absolute" in term.lower() or "overgeneralization" in term.lower() for term in data["logical_issues"])

        # 4. Academic testing recommendation
        next_step_lower = data["recommended_next_step"].lower()
        assert any(term in next_step_lower for term in ["deliberate", "active recall", "hours", "test", "efficiency"])

        # 5. No irrelevant business risks
        all_text = " ".join(data["potential_risks"] + data["potential_advantages"]).lower()
        assert "angel investor" not in all_text
        assert "liquidity" not in all_text

        # 6. 4-pillar confidence rubric verification
        conf = data["confidence"]
        assert "components" in conf and conf["components"] is not None
        comps = conf["components"]
        assert "empirical_verifiability" in comps
        assert "logical_validity" in comps
        assert "contextual_completeness" in comps
        assert "epistemic_humility" in comps
        assert conf["score"] == (comps["empirical_verifiability"] + comps["logical_validity"] + comps["contextual_completeness"] + comps["epistemic_humility"])

        # 7. Counterarguments and evidence separation present
        assert len(data["counterarguments"]) > 0
        assert data["evidence_verification"] is not None
        assert len(data["evidence_verification"]["established_facts"]) > 0

@pytest.mark.asyncio
async def test_openai_quota_exhausted_error_handling():
    """Verifies that an OpenAI 429 insufficient_quota error is caught without retry, sets api_status, and discloses fallback."""
    import openai
    mock_client = MagicMock()
    # Create mock response object for RateLimitError
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {}
    err = openai.RateLimitError(
        message="You exceeded your current quota, please check your plan and billing details.",
        response=mock_resp,
        body={"error": {"message": "You exceeded your current quota", "type": "insufficient_quota", "code": "insufficient_quota"}}
    )
    mock_client.chat.completions.create = AsyncMock(side_effect=err)

    req = AnalysisRequest(
        text="Starting a technology venture requires careful risk calibration.",
        category=CategoryEnum.RISK_ANALYSIS
    )

    orig_get = ai_service._get_client
    ai_service._get_client = lambda: mock_client
    try:
        res = await ai_service.analyze(req)
        assert res.is_demo_mode is True
        assert res.engine_used == "heuristic_fallback"
        assert res.api_status == "quota_exceeded"
        assert "insufficient_quota" in res.api_error_message or "quota" in res.api_error_message.lower()
        # Ensure fallback notice is explicitly in limitations
        assert "offline heuristic engine" in res.limitations_and_uncertainty or "fallback analytical engine" in res.limitations_and_uncertainty
    finally:
        ai_service._get_client = orig_get

@pytest.mark.asyncio
async def test_openai_auth_error_handling():
    """Verifies that an OpenAI 401 AuthenticationError is properly categorized and not retried."""
    import openai
    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.headers = {}
    err = openai.AuthenticationError(
        message="Incorrect API key provided.",
        response=mock_resp,
        body={"error": {"message": "Incorrect API key provided.", "type": "invalid_request_error"}}
    )
    mock_client.chat.completions.create = AsyncMock(side_effect=err)

    req = AnalysisRequest(
        text="Cryptographic hashing guarantees data integrity.",
        category=CategoryEnum.FACT_CHECK
    )

    orig_get = ai_service._get_client
    ai_service._get_client = lambda: mock_client
    try:
        res = await ai_service.analyze(req)
        assert res.is_demo_mode is True
        assert res.api_status == "auth_error"
        assert "API key" in res.api_error_message
    finally:
        ai_service._get_client = orig_get

@pytest.mark.asyncio
async def test_flat_earth_contradicted_test_case():
    """Tests the scientific test case: 'The Earth is flat.'"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/analyze", json={
            "text": "The Earth is flat.",
            "category": "Fact Check"
        })
        assert res.status_code == 201
        data = res.json()
        assert data["verdict"] == "CONTRADICTED"
        assert any("Conspiracy" in issue or "Empirical" in issue for issue in data["logical_issues"])
        assert len(data["counterarguments"]) > 0

@pytest.mark.asyncio
async def test_remote_work_universally_superior_test_case():
    """Tests 'Remote work is universally superior to office work.'"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/analyze", json={
            "text": "Remote work is universally superior to office work.",
            "category": "General Assumption"
        })
        assert res.status_code == 201
        data = res.json()
        assert data["verdict"] == "CONTEXT DEPENDENT"
        assert any("Generalization" in issue or "Universal" in issue for issue in data["logical_issues"])

@pytest.mark.asyncio
async def test_invest_all_savings_test_case():
    """Tests 'If we invest all our savings in this business, we will definitely succeed.'"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/analyze", json={
            "text": "If we invest all our savings in this business, we will definitely succeed.",
            "category": "Risk Analysis"
        })
        assert res.status_code == 201
        data = res.json()
        assert data["verdict"] == "POTENTIALLY RISKY"
        assert len(data["potential_risks"]) > 0

@pytest.mark.asyncio
async def test_5am_waking_success_test_case():
    """Tests 'Everyone who wakes up at 5 AM becomes successful.'"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/analyze", json={
            "text": "Everyone who wakes up at 5 AM becomes successful.",
            "category": "General Assumption"
        })
        assert res.status_code == 201
        data = res.json()
        assert data["verdict"] == "CONTEXT DEPENDENT"
        assert any("Post Hoc" in issue or "Causality" in issue or "Generalization" in issue for issue in data["logical_issues"])

@pytest.mark.asyncio
async def test_all_five_analytical_categories():
    """Verifies that all 5 analytical categories can be processed and persisted."""
    categories = [
        "General Assumption",
        "Fact Check",
        "Personal Decision",
        "Logical Fallacy",
        "Risk Analysis"
    ]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for cat in categories:
            res = await client.post("/api/analyze", json={
                "text": f"Testing categorization for {cat} scenario.",
                "category": cat
            })
            assert res.status_code == 201
            data = res.json()
            assert data["category"] == cat
            assert data["verdict"] in ["SUPPORTED", "CONTRADICTED", "INSUFFICIENT EVIDENCE", "CONTEXT DEPENDENT", "POTENTIALLY RISKY"]
            assert data["confidence"]["score"] >= 0

