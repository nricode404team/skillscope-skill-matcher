"""
OCR service using HuggingFace Qwen2.5-VL via InferenceClient (router.huggingface.co).
Falls back to chunked processing for very large images.
"""
import os
import io
import base64
from PIL import Image, ImageOps
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = (os.getenv("HF_API_TOKEN") or "").strip()
if HF_API_TOKEN == "your_huggingface_token_here":
    HF_API_TOKEN = ""

OCR_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct"
MAX_CHUNK_SIZE = (1024, 1024)
CHUNK_OVERLAP = 100
SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif"}


def _get_client():
    from huggingface_hub import InferenceClient
    return InferenceClient(token=HF_API_TOKEN or None, provider="auto")


def _image_to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _call_vlm(img: Image.Image) -> str:
    b64 = _image_to_b64(img)
    client = _get_client()
    result = client.chat_completion(
        model=OCR_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Extract all text from this image exactly as it appears. "
                            "Return only the extracted text, preserving line breaks. "
                            "Do not add explanations or commentary."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{b64}"},
                    },
                ],
            }
        ],
        max_tokens=2048,
    )
    return result.choices[0].message.content or ""


def _preprocess_image(img: Image.Image) -> Image.Image:
    """Apply lightweight OCR-friendly preprocessing."""
    img = img.convert("RGB")
    # Upscale tiny images so text is legible
    if max(img.size) < 800:
        scale = 800 / max(img.size)
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size, Image.LANCZOS)
    return img


def _slice_image(img: Image.Image) -> list:
    """Slice large image into overlapping chunks."""
    width, height = img.size
    cw, ch = MAX_CHUNK_SIZE
    chunks = []
    step_x = max(1, cw - CHUNK_OVERLAP)
    step_y = max(1, ch - CHUNK_OVERLAP)
    for y in range(0, height, step_y):
        for x in range(0, width, step_x):
            box = (x, y, min(x + cw, width), min(y + ch, height))
            chunk = img.crop(box)
            # Skip mostly blank chunks
            gray = chunk.convert("L")
            pixels = list(gray.getdata())
            avg = sum(pixels) / len(pixels) if pixels else 255
            if avg < 252:
                chunks.append(chunk)
    return chunks


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extract text from an image file using HuggingFace Qwen2.5-VL via InferenceClient.
    Handles large images by slicing into chunks.
    """
    if not HF_API_TOKEN:
        raise Exception(
            "No HuggingFace API token configured. Set HF_API_TOKEN in backend/.env"
        )

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = _preprocess_image(img)
    except Exception as e:
        raise Exception(f"Could not open image: {str(e)}")

    width, height = img.size
    cw, ch = MAX_CHUNK_SIZE

    # If image fits in one chunk, process directly
    if width <= cw and height <= ch:
        try:
            text = _call_vlm(img)
            return text.strip()
        except Exception as e:
            raise Exception(f"OCR failed: {str(e)}")

    # Slice into chunks and combine
    chunks = _slice_image(img)
    if not chunks:
        raise Exception("Image appears to be blank or unreadable.")

    # Limit to 12 chunks to avoid excessive API calls
    chunks = chunks[:12]
    texts = []
    for chunk in chunks:
        try:
            result = _call_vlm(chunk)
            if result.strip():
                texts.append(result.strip())
        except Exception:
            continue

    if not texts:
        raise Exception(
            "Could not extract any text from the image. "
            "Make sure the image is clear and contains readable text."
        )

    return "\n".join(texts)
