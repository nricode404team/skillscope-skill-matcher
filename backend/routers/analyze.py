from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from services.gap_analyzer import analyze_gap

router = APIRouter(prefix="/api", tags=["analyze"])


class JobItem(BaseModel):
    title: str = "Job Position"
    skills: list[str]


class AnalyzeRequest(BaseModel):
    resume_skills: list[str]
    jobs: list[JobItem]


@router.post("/analyze")
async def analyze(body: AnalyzeRequest):
    if not body.resume_skills:
        raise HTTPException(status_code=400, detail="No resume skills provided.")
    if not body.jobs:
        raise HTTPException(status_code=400, detail="No job descriptions provided.")

    results = []
    for job in body.jobs:
        try:
            result = analyze_gap(body.resume_skills, job.skills, job.title)
            results.append(result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis failed for '{job.title}': {str(e)}")

    return JSONResponse({"results": results})
