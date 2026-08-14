from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import global_search

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search(q: str = "", db: Session = Depends(get_db)):
    # Global search across meeting titles and transcript content
    if not q.strip():
        return SearchResponse(query=q, total_results=0, results=[])

    results = global_search(db, q)
    return SearchResponse(
        query=q,
        total_results=len(results),
        results=results,
    )
