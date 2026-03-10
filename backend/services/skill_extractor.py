import re
from services.hf_service import extract_entities, ai_extract_skills

# Words that are never skills — locations, countries, continents, generic org words.
# Used as a blocklist after NER extraction.
_GEO_ORG_NOISE = {
    # Continents / regions
    "africa", "america", "americas", "asia", "australia", "europe", "oceania",
    # Countries (common)
    "australia", "brazil", "canada", "china", "france", "germany", "india",
    "indonesia", "ireland", "israel", "italy", "japan", "mexico", "netherlands",
    "new zealand", "nigeria", "pakistan", "poland", "portugal", "russia",
    "saudi arabia", "singapore", "south africa", "spain", "sweden", "turkey",
    "ukraine", "united kingdom", "united states", "usa", "uk", "uae",
    # US states / major cities (common false positives)
    "alabama", "alaska", "arizona", "california", "colorado", "florida",
    "georgia", "hawaii", "illinois", "indiana", "iowa", "kansas", "kentucky",
    "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota",
    "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire",
    "new jersey", "new mexico", "new york", "north carolina", "north dakota",
    "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
    "south dakota", "tennessee", "texas", "utah", "vermont", "virginia",
    "washington", "west virginia", "wisconsin", "wyoming",
    "atlanta", "austin", "boston", "chicago", "dallas", "denver", "detroit",
    "houston", "las vegas", "los angeles", "miami", "minneapolis", "nashville",
    "new york city", "nyc", "philadelphia", "phoenix", "portland", "san diego",
    "san francisco", "seattle", "washington dc",
    # Other world cities
    "amsterdam", "bangalore", "barcelona", "beijing", "berlin", "dubai",
    "dublin", "hong kong", "istanbul", "jakarta", "johannesburg", "karachi",
    "lagos", "london", "madrid", "melbourne", "mexico city", "moscow",
    "mumbai", "nairobi", "paris", "rome", "seoul", "shanghai", "sydney",
    "taipei", "tehran", "tokyo", "toronto", "vancouver", "vienna", "zurich",
    # Generic org / institution noise
    "university", "college", "institute", "school", "academy", "corporation",
    "company", "llc", "inc", "ltd", "group", "foundation", "association",
    "international", "national", "global", "federal", "state",
}

# Comprehensive skill keyword list
SKILL_KEYWORDS = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "bash", "shell", "sql", "html", "css", "sass", "less",
    # Frontend
    "react", "reactjs", "react.js", "vue", "vuejs", "angular", "svelte",
    "next.js", "nextjs", "nuxt", "gatsby", "tailwindcss", "tailwind",
    "bootstrap", "material-ui", "mui", "chakra ui", "webpack", "vite",
    "redux", "zustand", "mobx", "graphql", "rest api", "restful",
    # Backend
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring",
    "spring boot", "laravel", "rails", "ruby on rails", "asp.net", ".net",
    "nestjs", "nest.js", "hapi", "koa",
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "elasticsearch", "cassandra", "dynamodb", "firebase", "supabase",
    "prisma", "sequelize", "mongoose", "sqlalchemy",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd", "nginx",
    "linux", "unix", "git", "github", "gitlab", "bitbucket",
    # Data & AI
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "matplotlib", "seaborn", "tableau", "power bi", "spark", "hadoop",
    "airflow", "kafka", "data analysis", "data science", "llm",
    # Mobile
    "react native", "flutter", "android", "ios", "swift", "xcode",
    # Testing
    "jest", "pytest", "selenium", "cypress", "unit testing", "tdd",
    # Soft skills
    "leadership", "communication", "teamwork", "problem solving",
    "project management", "agile", "scrum", "kanban", "jira",
    # Other
    "microservices", "api", "oauth", "jwt", "websockets", "grpc",
    "figma", "photoshop", "ux", "ui design",
}


def normalize_skill(skill: str) -> str:
    skill = skill.lower().strip()
    aliases = {
        "js": "javascript",
        "ts": "typescript",
        "py": "python",
        "ml": "machine learning",
        "dl": "deep learning",
        "k8s": "kubernetes",
        "tf": "tensorflow",
        "react.js": "react",
        "reactjs": "react",
        "node.js": "node.js",
        "nodejs": "node.js",
        "nextjs": "next.js",
        "vuejs": "vue",
        "postgres": "postgresql",
        "gcp": "google cloud",
        "cpp": "c++",
    }
    return aliases.get(skill, skill)


def _keyword_extract(text: str) -> list[str]:
    """Keyword + NER based extraction (fallback)."""
    text_lower = text.lower()
    found_skills = set()

    for skill in SKILL_KEYWORDS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)

    try:
        ner_entities = extract_entities(text)
        for entity in ner_entities:
            normalized = normalize_skill(entity)
            # Only accept if it matches a known skill keyword AND is not geo/org noise
            if normalized in SKILL_KEYWORDS and normalized not in _GEO_ORG_NOISE:
                found_skills.add(normalized)
    except Exception:
        pass

    normalized = {normalize_skill(s) for s in found_skills}
    return sorted([s.title() if len(s) > 3 else s.upper() for s in normalized])


def extract_skills(text: str) -> list[str]:
    """
    Extract skills using AI (Qwen2.5 LLM) as primary method,
    falling back to keyword + NER matching if AI is unavailable.
    """
    try:
        ai_skills = ai_extract_skills(text)
        if ai_skills:
            return ai_skills
    except Exception:
        pass  # Fall through to keyword extraction

    return _keyword_extract(text)
