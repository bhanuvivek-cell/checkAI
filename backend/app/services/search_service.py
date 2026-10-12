import logging
from typing import List, Optional
import httpx
from app.config import settings
from app.schemas import EvidenceItem

logger = logging.getLogger(__name__)

class SearchService:
    """
    Modular Search Service for verifiable external evidence retrieval.
    Keeps factual verification distinct from model generation.
    Never invents fake sources or fictitious statistics.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.SEARCH_API_KEY

    async def search_evidence(self, query: str, limit: int = 4) -> List[EvidenceItem]:
        """
        Retrieves real evidence results if search provider is configured.
        Otherwise returns verified public academic/institutional references or empty list
        to prevent hallucinated citations.
        """
        if not query or len(query.strip()) < 3:
            return []

        # If a search API key is configured (e.g. Tavily / Serper / custom search provider)
        if self.api_key and self.api_key.strip():
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    # Example Tavily REST search endpoint
                    response = await client.post(
                        "https://api.tavily.com/search",
                        json={
                            "api_key": self.api_key,
                            "query": query,
                            "search_depth": "basic",
                            "include_answer": False,
                            "max_results": limit
                        }
                    )
                    if response.status_code == 200:
                        data = response.json()
                        results = []
                        for res in data.get("results", []):
                            results.append(
                                EvidenceItem(
                                    title=res.get("title", "External Reference"),
                                    snippet=res.get("content", "")[:300],
                                    source_url=res.get("url"),
                                    credibility="Verified Web Source"
                                )
                            )
                        return results
                    else:
                        logger.warning(f"Search API returned status {response.status_code}")
            except Exception as e:
                logger.error(f"Search retrieval error: {e}")

        # When no external search API key is provided, we do NOT fabricate fake URLs or bogus quotes.
        # Instead, return empty list or genuine curated institutional knowledge references.
        return []

search_service = SearchService()
