# SkillScope — Resume Skill Gap Analyzer

SkillScope compares your resume against any number of job descriptions and tells you exactly which skills you have, which you're missing, and what to learn first. No account required — everything runs locally.

---

## Features

- **Resume parsing** — upload a PDF, DOCX, or paste plain text; skills are extracted automatically using a keyword + NER pipeline
- **Job description ingestion** — paste text or provide a URL; the scraper fetches and parses the posting for you
- **Multi-job comparison** — analyze up to 5 roles side-by-side with ranked match percentages
- **Gap analysis** — see missing skills per role, sorted by priority
- **Analysis history** — past runs are saved in `localStorage` and can be restored at any time
- **Zero AI dependency** — skill extraction uses regex keyword matching and BERT NER (`dslim/bert-base-NER`); the HuggingFace token is only required for the embedding/similarity features

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Recharts |
| Backend | FastAPI, Uvicorn, Python 3.11 |
| NLP / AI | HuggingFace Hub (`dslim/bert-base-NER`, `all-MiniLM-L6-v2`) |
| Resume parsing | pdfplumber (PDF), python-docx (DOCX) |
| Job scraping | BeautifulSoup4, httpx |

---

## Project Structure

```
app/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env                     # HuggingFace token (see setup)
│   ├── routers/
│   │   ├── resume.py            # POST /api/upload-resume
│   │   ├── jobs.py              # POST /api/fetch-job, /api/fetch-job-image
│   │   └── analyze.py           # POST /api/analyze
│   └── services/
│       ├── skill_extractor.py   # Keyword + NER skill extraction pipeline
│       ├── hf_service.py        # HuggingFace API wrappers (NER, embeddings)
│       ├── gap_analyzer.py      # Skill matching and gap scoring logic
│       ├── ocr_service.py       # Image → text via Pillow
│       └── scraper.py           # URL → raw text via BeautifulSoup
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── FeaturesPage.jsx
    │   │   ├── AboutPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── components/
    │   │   ├── AnalyzerWorkspace.jsx
    │   │   ├── ResumeUpload.jsx
    │   │   ├── JobDescriptionInput.jsx
    │   │   ├── SkillGapResults.jsx
    │   │   ├── HistoryPanel.jsx
    │   │   └── StepIndicator.jsx
    │   ├── hooks/
    │   │   └── useAnalysisHistory.js
    │   └── api.js               # Axios instance pointed at backend
    └── package.json
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- A free [HuggingFace account](https://huggingface.co) with a read-access API token

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/skillscope.git
cd skillscope
```

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure your HuggingFace token
cp .env.example .env        # or create .env manually
# Edit .env and set:
#   HF_API_TOKEN=hf_your_token_here

# Start the development server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> The frontend proxies API calls to `http://localhost:8000` via the `api.js` Axios base URL. If you change the backend port, update `frontend/src/api.js` accordingly.

---

## Environment Variables

Create `backend/.env` with the following:

```env
HF_API_TOKEN=hf_your_token_here
```

| Variable | Required | Description |
|---|---|---|
| `HF_API_TOKEN` | Recommended | HuggingFace read token. Without it, NER and embedding features are skipped and only keyword matching runs. |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload-resume` | Upload a PDF/DOCX/image or send `{ "text": "..." }` — returns extracted skills |
| `POST` | `/api/fetch-job` | Send `{ "text": "..." }` or `{ "url": "..." }` — returns skills from a job posting |
| `POST` | `/api/fetch-job-image` | Upload an image of a job posting — returns skills via OCR |
| `POST` | `/api/analyze` | Send `{ resume_skills, jobs }` — returns gap analysis results |

---

## How Skill Extraction Works

Both resume and job description text go through the same two-stage pipeline:

1. **Keyword matching** — the text is scanned against a curated list of 500+ technical skills (languages, frameworks, tools, cloud services, etc.) using case-insensitive regex.

2. **BERT NER filtering** — `dslim/bert-base-NER` tags tokens. Only `MISC`-tagged entities (technical terms) are considered; `PER` (people), `ORG` (organisations), and `LOC` (locations) are explicitly discarded so that company names, university names, cities, and countries are never surfaced as skills.

---

## Production Build

```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

Serve `dist/` with any static file host (Vercel, Netlify, S3, etc.) and point `VITE_API_URL` at your deployed backend.

---

## License

MIT
