import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def scrape_job_url(url: str) -> str:
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise Exception("The URL took too long to respond. Please paste the job description text instead.")
    except requests.exceptions.HTTPError as e:
        raise Exception(f"Could not access the URL (HTTP {e.response.status_code}). Please paste the text instead.")
    except Exception as e:
        raise Exception(f"Failed to fetch URL: {str(e)}. Please paste the job description text instead.")

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove scripts and styles
    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
        tag.decompose()

    # Try common job description containers
    selectors = [
        {"class": lambda c: c and any(k in " ".join(c).lower() for k in ["job-description", "jobdescription", "job_description", "description"])},
        {"id": lambda i: i and any(k in i.lower() for k in ["job-description", "jobdescription", "description"])},
        "article",
        "main",
        {"class": lambda c: c and "content" in " ".join(c).lower()},
    ]

    for selector in selectors:
        if isinstance(selector, dict):
            el = soup.find(attrs=selector)
        else:
            el = soup.find(selector)
        if el:
            text = el.get_text(separator=" ", strip=True)
            if len(text) > 200:
                return text[:5000]

    # Fallback: get all body text
    body = soup.find("body")
    if body:
        text = body.get_text(separator=" ", strip=True)
        return text[:5000]

    return soup.get_text(separator=" ", strip=True)[:5000]
