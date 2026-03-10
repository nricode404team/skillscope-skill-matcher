import os
import time
import json
import re
import requests
import numpy as np
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = (os.getenv("HF_API_TOKEN") or "").strip()
if HF_API_TOKEN == "your_huggingface_token_here":
    HF_API_TOKEN = ""

HEADERS = {}
if HF_API_TOKEN:
    HEADERS["Authorization"] = f"Bearer {HF_API_TOKEN}"
BASE_URL = "https://api-inference.huggingface.co/models"

NER_MODEL = "dslim/bert-base-NER"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CLASSIFIER_MODEL = "facebook/bart-large-mnli"
LLM_MODEL = "Qwen/Qwen2.5-72B-Instruct"


def _call_api(model: str, payload: dict, retries: int = 3) -> dict | list:
    url = f"{BASE_URL}/{model}"
    for attempt in range(retries):
        try:
            response = requests.post(url, headers=HEADERS, json=payload, timeout=60)
            if response.status_code == 503:
                # Model is loading
                wait = response.json().get("estimated_time", 20)
                time.sleep(min(wait, 30))
                continue
            if response.status_code == 429:
                time.sleep(10)
                continue
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            if attempt == retries - 1:
                raise Exception(f"HuggingFace API timeout for model {model}")
            time.sleep(5)
        except Exception as e:
            if attempt == retries - 1:
                raise Exception(f"HuggingFace API error: {str(e)}")
            time.sleep(5)
    raise Exception(f"Failed to call {model} after {retries} attempts")


def get_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    from huggingface_hub import InferenceClient
    client = InferenceClient(token=HF_API_TOKEN or None, provider="auto")
    result = client.feature_extraction(texts, model=EMBEDDING_MODEL)
    if hasattr(result, "tolist"):
        result = result.tolist()
    # If 3-D (batch × tokens × dim), mean-pool over token axis
    if result and isinstance(result[0][0], list):
        result = [[sum(col) / len(col) for col in zip(*row)] for row in result]
    return result


def extract_entities(text: str) -> list[str]:
    """
    Extract only MISC-tagged entities from NER — these correspond to
    technical terms, frameworks, and tools. PER/ORG/LOC are explicitly
    excluded to prevent names, companies, and locations being treated as skills.
    """
    try:
        from huggingface_hub import InferenceClient
        client = InferenceClient(token=HF_API_TOKEN or None, provider="auto")
        items = client.token_classification(text[:2000], model=NER_MODEL)

        entities = []
        current_word = ""
        current_tag = ""

        for item in items:
            if isinstance(item, dict):
                word = item.get("word", "")
                tag = item.get("entity", "") or item.get("entity_group", "")
            else:
                word = getattr(item, "word", "")
                tag = getattr(item, "entity", "") or getattr(item, "entity_group", "")

            # Normalise tag: B-MISC / I-MISC / MISC → keep; anything else → skip
            tag_upper = tag.upper()
            is_misc = "MISC" in tag_upper
            is_continuation = word.startswith("##")

            if is_continuation:
                current_word += word[2:]
            else:
                if current_word and current_tag:
                    entities.append((current_word, current_tag))
                current_word = word
                current_tag = tag_upper

        if current_word and current_tag:
            entities.append((current_word, current_tag))

        # Only return words whose tag is MISC
        return [word for word, tag in entities if "MISC" in tag and len(word) > 1]
    except Exception:
        return []


def ai_extract_skills(text: str) -> list[str]:
    """
    Use Qwen2.5 LLM to extract skills from resume or job description text.
    Returns a list of skill strings. Raises on failure so caller can fall back.
    """
    if not HF_API_TOKEN:
        raise Exception("No HF token configured")

    from huggingface_hub import InferenceClient
    client = InferenceClient(token=HF_API_TOKEN, provider="auto")

    prompt = (
        "Your job is to extract skills that are EXPLICITLY and LITERALLY written in the text below. "
        "Rules:\n"
        "- Only include skills that appear word-for-word in the text.\n"
        "- Do NOT infer, assume, or add related/similar skills that are not written there.\n"
        "- Do NOT include job titles, company names, years of experience, or generic words like 'experience' or 'knowledge'.\n"
        "- If a skill appears as part of a phrase (e.g. 'experience with React'), extract just the skill ('React').\n"
        "- Return ONLY a JSON array of skill strings. No explanation, no markdown, just the array.\n\n"
        f"TEXT:\n{text[:4000]}\n\n"
        "JSON array:"
    )

    response = client.chat_completion(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )

    content = response.choices[0].message.content.strip()

    # Parse JSON array from response
    # Handle markdown code fences
    content = re.sub(r"```(?:json)?", "", content).strip().strip("`").strip()
    # Find the JSON array
    match = re.search(r"\[.*?\]", content, re.DOTALL)
    if not match:
        raise Exception("LLM did not return a valid JSON array")

    raw_skills = json.loads(match.group())
    # Normalise: strip whitespace, deduplicate, filter empties
    seen = set()
    result = []
    for s in raw_skills:
        s = str(s).strip()
        if s and s.lower() not in seen:
            seen.add(s.lower())
            result.append(s)
    return result


def classify_skills(skills: list[str], categories: list[str]) -> dict:
    if not skills:
        return {}
    results = {}
    for skill in skills[:20]:  # limit to avoid rate limits
        try:
            result = _call_api(
                CLASSIFIER_MODEL,
                {
                    "inputs": skill,
                    "parameters": {"candidate_labels": categories},
                    "options": {"wait_for_model": True},
                },
            )
            if result and "labels" in result:
                results[skill] = result["labels"][0]
        except Exception:
            results[skill] = "Technical Skills"
    return results
