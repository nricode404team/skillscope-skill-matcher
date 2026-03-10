import io
import pdfplumber
import docx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from services.skill_extractor import _keyword_extract as extract_skills
from services.ocr_service import extract_text_from_image, SUPPORTED_FORMATS

router = APIRouter(prefix="/api", tags=["resume"])

IMAGE_EXTENSIONS = SUPPORTED_FORMATS


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
):
    raw_text = ""

    if file and file.filename:
        content = await file.read()
        filename = file.filename.lower()
        ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""

        if filename.endswith(".pdf"):
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    raw_text = "\n".join(
                        page.extract_text() or "" for page in pdf.pages
                    )
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

        elif filename.endswith(".docx"):
            try:
                doc = docx.Document(io.BytesIO(content))
                raw_text = "\n".join(para.text for para in doc.paragraphs)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {str(e)}")

        elif filename.endswith(".txt"):
            raw_text = content.decode("utf-8", errors="ignore")

        elif ext in IMAGE_EXTENSIONS:
            try:
                raw_text = extract_text_from_image(content)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Image OCR failed: {str(e)}")

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Use PDF, DOCX, TXT, or an image (JPG, PNG, BMP, WEBP, TIFF).",
            )

    elif text:
        raw_text = text

    else:
        raise HTTPException(status_code=400, detail="No file or text provided.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the provided input.")

    try:
        skills = extract_skills(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

    return JSONResponse({"raw_text": raw_text[:3000], "skills": skills})
