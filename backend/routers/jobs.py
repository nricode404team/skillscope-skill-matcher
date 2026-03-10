from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from services.skill_extractor import _keyword_extract as extract_skills
from services.scraper import scrape_job_url
from services.ocr_service import extract_text_from_image, SUPPORTED_FORMATS

router = APIRouter(prefix="/api", tags=["jobs"])

IMAGE_EXTENSIONS = SUPPORTED_FORMATS


class JobInput(BaseModel):
    url: str | None = None
    text: str | None = None


@router.post("/fetch-job")
async def fetch_job(body: JobInput):
    raw_text = ""

    if body.url:
        try:
            raw_text = scrape_job_url(body.url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif body.text:
        raw_text = body.text
    else:
        raise HTTPException(status_code=400, detail="Provide a URL or text.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the job description.")

    try:
        skills = extract_skills(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

    return JSONResponse({"raw_text": raw_text[:2000], "skills": skills})


@router.post("/fetch-job-image")
async def fetch_job_image(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
):
    filename = file.filename.lower() if file.filename else ""
    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""

    if ext not in IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Use: {', '.join(IMAGE_EXTENSIONS)}",
        )

    content = await file.read()
    try:
        raw_text = extract_text_from_image(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image OCR failed: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the image.")

    try:
        skills = extract_skills(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

    return JSONResponse({
        "raw_text": raw_text[:2000],
        "skills": skills,
        "title": title or "Job from Image",
    })
