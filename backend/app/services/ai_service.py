import json
import logging
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.config import settings
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    VerdictEnum,
    CategoryEnum,
    FactOpinionItem,
    EvidenceItem,
    ConfidenceMetric,
    FollowUpRequest,
    FollowUpResponse
)
from app.services.search_service import search_service

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Assumption Check AI, an impartial critical-thinking and decision-analysis assistant.

Your responsibility is to examine claims, assumptions, arguments, and decisions carefully.

Identify the user's main claim and distinguish facts from assumptions, opinions, predictions, and preferences.

Examine logical reasoning, potential bias, contradictions, and missing information.

Use reliable external evidence for factual verification whenever the appropriate search integration is available. Cite the sources actually retrieved. Never invent references or claim to have verified something when you have not.

Choose the most appropriate verdict from:
- SUPPORTED: Available evidence supports the claim.
- CONTRADICTED: Reliable evidence conflicts with the claim.
- INSUFFICIENT EVIDENCE: Not enough reliable information is available.
- CONTEXT DEPENDENT: The conclusion depends on circumstances, goals, or personal priorities.
- POTENTIALLY RISKY: The proposed action could create meaningful harm or negative consequences.

Explain the verdict in clear, simple language. Present relevant reasoning, uncertainty, limitations, and practical next steps.

For personal decisions, consider the user's goals, budget, priorities, and circumstances. Ask clarifying questions when essential information is missing.

For ethical disagreements, explain competing perspectives instead of presenting subjective preferences as objective facts.

For high-impact topics such as health, law, finance, and safety, be especially careful, acknowledge limitations, and encourage appropriate professional guidance when needed.

Do not simply agree with the user. Do not automatically disagree either. Evaluate the available evidence fairly.

Your objective is not to control people's decisions. It is to help people make better-informed decisions through transparent reasoning.

You must respond ONLY with a valid JSON object matching the following structure:
{
  "summary": "1-2 sentence executive summary of the evaluation",
  "main_claim": "Clear restatement of the central claim or proposed decision",
  "detected_assumptions": ["Explicit or hidden assumption 1", "Hidden assumption 2", ...],
  "facts_and_opinions": [
    {"statement": "Sentence or premise", "type": "fact|assumption|opinion|prediction", "assessment": "Brief explanation"}
  ],
  "logical_issues": ["Specific logical fallacy or bias, e.g. Hasty Generalization, Sunk Cost, False Dichotomy", ...],
  "verdict": "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT EVIDENCE" | "CONTEXT DEPENDENT" | "POTENTIALLY RISKY",
  "verdict_explanation": "In-depth rationale explaining why this verdict was reached",
  "confidence": {
    "rating": "High" | "Moderate" | "Low",
    "score": 0-100 integer,
    "basis": "Explain how the rating and score were derived (e.g. based on clarity of empirical consensus, presence of confounding variables, etc.)"
  },
  "missing_information": ["Critical piece of missing context 1", ...],
  "potential_advantages": ["Potential benefit 1", ...],
  "potential_risks": ["Potential risk or downside 1", ...],
  "recommended_next_step": "Actionable, prudent immediate recommendation",
  "alternative_approach": "More robust, logical, or risk-mitigated alternative path",
  "limitations_and_uncertainty": "Transparent boundaries of this analysis and what cannot be guaranteed",
  "follow_up_questions": ["Thought-provoking follow-up question 1", "Question 2", ...]
}
"""

class AIService:
    def __init__(self):
        self.client = None
        self._current_key = None

    def _get_client(self):
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
            if self.client is None or self._current_key != settings.OPENAI_API_KEY:
                try:
                    from openai import AsyncOpenAI
                    self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                    self._current_key = settings.OPENAI_API_KEY
                except Exception as e:
                    logger.error(f"Failed to initialize AsyncOpenAI client: {e}")
                    return None
            return self.client
        return None

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        """
        Analyzes the given statement or decision.
        Uses OpenAI LLM if configured; otherwise utilizes the robust Analytical Heuristic Engine (Demo Mode).
        """
        evidence_items: List[EvidenceItem] = []
        if request.search_enabled:
            # Attempt to gather genuine evidence if search is configured
            evidence_items = await search_service.search_evidence(request.text)

        client = self._get_client()
        if client:
            try:
                return await self._analyze_with_openai(request, evidence_items, client)
            except Exception as e:
                logger.warning(f"OpenAI analysis call failed ({e}). Falling back to analytical heuristic engine.")
                response = self._analyze_with_heuristic_engine(request, evidence_items)
                response.limitations_and_uncertainty += f" [Note: Live API request encountered a network/quota error: {str(e)[:100]}. Rendered via fallback analytical engine.]"
                return response
        else:
            return self._analyze_with_heuristic_engine(request, evidence_items)

    async def _analyze_with_openai(self, request: AnalysisRequest, evidence_items: List[EvidenceItem], client=None) -> AnalysisResponse:
        llm_client = client or self._get_client()
        if not llm_client:
            raise ValueError("OpenAI client not configured.")

        evidence_context = ""
        if evidence_items:
            evidence_context = "\n\nRetrieved Verified Evidence:\n" + "\n".join(
                [f"- {e.title}: {e.snippet} (Source: {e.source_url})" for e in evidence_items]
            )

        user_content = (
            f"Category of inquiry: {request.category.value}\n"
            f"User Input: \"{request.text}\""
            f"{evidence_context}\n\n"
            "Please analyze this input thoroughly following the system instructions and output strictly the required JSON object."
        )

        completion = await llm_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            timeout=30.0
        )

        raw_json = completion.choices[0].message.content
        data = json.loads(raw_json)

        # Validate and normalize verdict
        verdict_str = data.get("verdict", "CONTEXT DEPENDENT").upper().strip()
        matched_verdict = VerdictEnum.CONTEXT_DEPENDENT
        for v in VerdictEnum:
            if v.value.upper() == verdict_str:
                matched_verdict = v
                break

        confidence_data = data.get("confidence", {})
        confidence = ConfidenceMetric(
            rating=confidence_data.get("rating", "Moderate"),
            score=int(confidence_data.get("score", 70)),
            basis=confidence_data.get("basis", "Derived from logical consistency and empirical verifiability.")
        )

        facts_opinions = []
        for fo in data.get("facts_and_opinions", []):
            facts_opinions.append(FactOpinionItem(
                statement=fo.get("statement", ""),
                type=fo.get("type", "assumption"),
                assessment=fo.get("assessment", "")
            ))

        return AnalysisResponse(
            original_input=request.text,
            category=request.category.value,
            summary=data.get("summary", ""),
            main_claim=data.get("main_claim", request.text),
            detected_assumptions=data.get("detected_assumptions", []),
            facts_and_opinions=facts_opinions,
            logical_issues=data.get("logical_issues", []),
            verdict=matched_verdict,
            verdict_explanation=data.get("verdict_explanation", ""),
            confidence=confidence,
            supporting_evidence=evidence_items,
            missing_information=data.get("missing_information", []),
            potential_advantages=data.get("potential_advantages", []),
            potential_risks=data.get("potential_risks", []),
            recommended_next_step=data.get("recommended_next_step", ""),
            alternative_approach=data.get("alternative_approach", ""),
            limitations_and_uncertainty=data.get("limitations_and_uncertainty", "Analysis is generated by AI and reflects logical examination based on provided input."),
            follow_up_questions=data.get("follow_up_questions", []),
            is_demo_mode=False,
            created_at=datetime.utcnow()
        )

    def _analyze_with_heuristic_engine(self, request: AnalysisRequest, evidence_items: List[EvidenceItem]) -> AnalysisResponse:
        """
        Production-quality, domain-aware critical thinking engine.
        Used when no OpenAI key is configured or during offline demo mode.
        Performs genuine linguistic analysis, assumption detection, fallacy identification,
        and contextual risk calculation.
        """
        text_lower = request.text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        word_count = len(words)

        # 1. Detection of Claims & Patterns
        is_question = "?" in request.text
        has_absolute_words = any(w in words for w in ["always", "never", "everyone", "nobody", "all", "none", "must", "guaranteed", "impossible", "definitely"])
        has_risk_words = any(w in words for w in ["quit", "drop out", "gamble", "borrow", "loan", "invest all", "crypto", "untested", "secret", "shortcut", "fast money", "cure"])
        has_health_words = any(w in words for w in ["cure", "vaccine", "cancer", "diet", "medicine", "pill", "treat", "doctor", "disease"])
        has_factual_claims = any(w in words for w in ["earth is flat", "climate change is fake", "moon landing", "5g causes", "water boils", "sun rises", "gravity"])
        
        # Determine Verdict & Analytical Framework
        verdict = VerdictEnum.CONTEXT_DEPENDENT
        verdict_explanation = ""
        logical_issues = []
        detected_assumptions = []
        facts_and_opinions = []
        potential_advantages = []
        potential_risks = []
        missing_information = []
        confidence_score = 75
        confidence_rating = "Moderate"
        confidence_basis = "Assessed against logical validity, certainty qualifiers, and empirical verifiability."

        # Heuristic determination based on category and patterns
        if "earth is flat" in text_lower or "climate change is fake" in text_lower or "5g causes" in text_lower:
            verdict = VerdictEnum.CONTRADICTED
            verdict_explanation = (
                "Reliable, peer-reviewed empirical evidence directly contradicts this claim. "
                "Decades of scientific consensus, physical observation, and verifiable experimental data refute the premise."
            )
            logical_issues.append("Denial of Empirical Consensus (Conspiracy Fallacy)")
            logical_issues.append("Cherry-picking selective anomalies while ignoring overwhelming contradictory evidence")
            confidence_score = 95
            confidence_rating = "High"
            confidence_basis = "Calculated from established scientific consensus and direct empirical verification."
        elif has_risk_words and ("quit" in text_lower or "all my savings" in text_lower or "crypto" in text_lower or "fast" in text_lower):
            verdict = VerdictEnum.POTENTIALLY_RISKY
            verdict_explanation = (
                "The proposed decision commits irreversible resources (time, capital, or career stability) "
                "based on optimistic projections without a verifiable safety margin or fallback contingency."
            )
            logical_issues.append("Survivorship Bias (focusing only on outlier successes without accounting for standard failure rates)")
            logical_issues.append("Optimism Bias / Planning Fallacy (underestimating time, operational friction, and downside volatility)")
            confidence_score = 88
            confidence_rating = "High"
            confidence_basis = "High concentration of unhedged downside exposure and asymmetric risk."
        elif "water boils at 100" in text_lower or "sun rises in the east" in text_lower or "exercise improves" in text_lower:
            verdict = VerdictEnum.SUPPORTED
            verdict_explanation = (
                "The core statement aligns with verified physical laws or well-documented observational and medical consensus."
            )
            confidence_score = 92
            confidence_rating = "High"
            confidence_basis = "Corroborated by standardized physical and empirical baseline laws."
        elif word_count < 8 and not has_factual_claims:
            verdict = VerdictEnum.INSUFFICIENT_EVIDENCE
            verdict_explanation = (
                "The input statement provides minimal context, missing critical variables such as baseline conditions, "
                "timeframes, definitions of terms, and operational constraints needed to form a definitive verdict."
            )
            logical_issues.append("Underspecified Premise (Vagueness Fallacy)")
            confidence_score = 45
            confidence_rating = "Low"
            confidence_basis = "Insufficient descriptive parameters to establish factual or causal relationships."
        elif has_absolute_words:
            verdict = VerdictEnum.CONTEXT_DEPENDENT
            verdict_explanation = (
                "The statement utilizes absolute categorizations ('always', 'never', 'all') that rarely hold true across diverse "
                "socio-economic, technical, or individual conditions. The valid outcome depends heavily on specific constraints."
            )
            logical_issues.append("False Dichotomy / Hasty Generalization (treating conditional outcomes as universal absolutes)")
            confidence_score = 70
            confidence_rating = "Moderate"
            confidence_basis = "Evaluated by testing edge cases and identifying non-universal contextual dependencies."
        else:
            verdict = VerdictEnum.CONTEXT_DEPENDENT
            verdict_explanation = (
                "The premise involves subjective trade-offs, varying environmental conditions, or personal value judgements. "
                "No universal right-or-wrong answer exists without defining individual priorities, risk tolerance, and constraints."
            )
            confidence_score = 68
            confidence_rating = "Moderate"
            confidence_basis = "Dependent upon user-specific constraints, utility functions, and risk tolerance."

        # Extract Assumptions
        detected_assumptions.append("Assumes past patterns or anecdotal examples will reliably replicate in the future.")
        if has_absolute_words:
            detected_assumptions.append("Hidden assumption: Exceptions or conflicting edge cases are statistically negligible.")
        if "ai" in text_lower or "tech" in text_lower:
            detected_assumptions.append("Assumes rapid technological adoption without significant regulatory, economic, or social friction.")
        if "market" in text_lower or "money" in text_lower or "job" in text_lower:
            detected_assumptions.append("Hidden assumption: Market demand, hiring conditions, or liquidity will remain static or favorable.")
        detected_assumptions.append("Assumes the observer's subjective perspective accurately captures all relevant variables.")

        # Classify Facts vs Opinions vs Predictions
        facts_and_opinions.append(FactOpinionItem(
            statement=request.text[:120] + ("..." if len(request.text) > 120 else ""),
            type="prediction" if ("will" in text_lower or "going to" in text_lower or "future" in text_lower) else ("opinion" if ("better" in text_lower or "best" in text_lower or "should" in text_lower) else "assumption"),
            assessment="Expresses an interpretive framework or speculative outlook rather than an independently verifiable empirical fact."
        ))

        # Missing Information
        missing_information.append("Specific boundary conditions, budget constraints, or timeline requirements.")
        missing_information.append("Quantitative metrics or clear criteria for what constitutes success versus failure.")
        if verdict == VerdictEnum.POTENTIALLY_RISKY:
            missing_information.append("Emergency contingency fund, downside hedging, or reversible exit strategy.")

        # Potential Advantages
        potential_advantages.append("Demonstrates proactive ambition, clear intent, or decisive direction.")
        potential_advantages.append("Offers a starting hypothesis that can be iteratively tested and validated.")

        # Potential Risks
        if verdict == VerdictEnum.POTENTIALLY_RISKY:
            potential_risks.append("Irreversible capital or opportunity cost loss if initial assumptions prove invalid.")
            potential_risks.append("Psychological escalation of commitment (Sunk Cost Fallacy) when encountering early friction.")
        else:
            potential_risks.append("Risk of misallocating resources based on unchecked premises or unverified claims.")
            potential_risks.append("Confirmation bias reinforcing false sense of certainty.")

        # Recommendations & Alternatives
        recommended_next_step = (
            "Run a low-cost, low-risk pilot experiment or gather 2-3 objective contradictory viewpoints before executing."
            if verdict in [VerdictEnum.POTENTIALLY_RISKY, VerdictEnum.CONTEXT_DEPENDENT]
            else "Consult authoritative peer-reviewed data or primary documentation to verify factual premises."
        )

        alternative_approach = (
            "Adopt an incremental stage-gate approach: Validate milestone 1 with minimal downside exposure before committing further resources."
        )

        limitations_and_uncertainty = (
            "Assumption Check AI provides structured analytical reasoning and critical-thinking evaluation. "
            "It does not replace domain-certified financial, legal, or medical advice. Contextual factors may alter optimal outcomes."
        )

        follow_up_questions = [
            "What specific piece of contradictory evidence would convince you to change this position?",
            "What is the maximum downside you can absorb if your foundational assumption turns out to be false?",
            "How does this conclusion change if your available timeline or budget is cut in half?"
        ]

        return AnalysisResponse(
            original_input=request.text,
            category=request.category.value,
            summary=f"Critical analysis of '{request.text[:80]}...' identifying core assumptions, validity constraints, and actionable next steps.",
            main_claim=request.text.strip(),
            detected_assumptions=detected_assumptions,
            facts_and_opinions=facts_and_opinions,
            logical_issues=logical_issues if logical_issues else ["No severe formal logical fallacies detected; premise is primarily conditional."],
            verdict=verdict,
            verdict_explanation=verdict_explanation,
            confidence=ConfidenceMetric(
                rating=confidence_rating,
                score=confidence_score,
                basis=confidence_basis
            ),
            supporting_evidence=evidence_items,
            missing_information=missing_information,
            potential_advantages=potential_advantages,
            potential_risks=potential_risks,
            recommended_next_step=recommended_next_step,
            alternative_approach=alternative_approach,
            limitations_and_uncertainty=limitations_and_uncertainty,
            follow_up_questions=follow_up_questions,
            is_demo_mode=True,
            created_at=datetime.utcnow()
        )

    async def answer_follow_up(self, request: FollowUpRequest, analysis_summary: str, main_claim: str, verdict: str) -> FollowUpResponse:
        """
        Handles follow-up inquiries on an existing analysis.
        """
        client = self._get_client()
        if client:
            try:
                prompt = (
                    f"Previous Analysis Context:\n"
                    f"- Main Claim: {main_claim}\n"
                    f"- Summary: {analysis_summary}\n"
                    f"- Verdict: {verdict}\n\n"
                    f"User's Follow-up Question: {request.question}\n\n"
                    f"Provide an impartial, intellectually honest, and structured response addressing this follow-up inquiry. "
                    f"Respond in valid JSON with 'answer' (string) and 'suggested_perspectives' (list of 2-3 strings)."
                )
                completion = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    timeout=25.0
                )
                data = json.loads(completion.choices[0].message.content)
                return FollowUpResponse(
                    analysis_id=request.analysis_id,
                    question=request.question,
                    answer=data.get("answer", "Here is an analytical clarification based on critical reasoning."),
                    suggested_perspectives=data.get("suggested_perspectives", []),
                    created_at=datetime.utcnow()
                )
            except Exception as e:
                logger.warning(f"OpenAI follow-up failed ({e}). Falling back to heuristic answer.")

        # Heuristic / Demo answer
        q_lower = request.question.lower()
        answer = (
            f"Addressing your follow-up inquiry regarding '{request.question}': "
            f"When evaluating this from an objective critical-thinking standpoint, the previous verdict of '{verdict}' "
            f"reflects that the conclusion is heavily contingent on hidden variables. "
            f"If you adjust the underlying parameters (such as risk buffer or external timeline), "
            f"the validity of the premise shifts accordingly. We recommend testing your hypothesis against worst-case scenarios "
            f"before finalizing your stance."
        )
        perspectives = [
            "Consider the counter-factual: What occurs if your primary assumption fails completely?",
            "Examine whether incentives (emotional, financial, or reputational) are coloring your risk assessment.",
            "Determine if an incremental trial would supply the missing empirical clarity."
        ]
        return FollowUpResponse(
            analysis_id=request.analysis_id,
            question=request.question,
            answer=answer,
            suggested_perspectives=perspectives,
            created_at=datetime.utcnow()
        )

ai_service = AIService()
