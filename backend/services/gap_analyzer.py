import numpy as np
from services.hf_service import get_embeddings

RESOURCE_MAP = {
    "default": lambda skill: [
        {"name": f"Search on Coursera", "url": f"https://www.coursera.org/search?query={skill.replace(' ', '+')}"},
        {"name": f"YouTube Tutorial", "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial"},
        {"name": f"Search on edX", "url": f"https://www.edx.org/search?q={skill.replace(' ', '+')}"},
    ]
}

SPECIAL_RESOURCES = {
    "python": [
        {"name": "Python Official Docs", "url": "https://docs.python.org/3/tutorial/"},
        {"name": "Coursera Python", "url": "https://www.coursera.org/search?query=python"},
        {"name": "YouTube Python", "url": "https://www.youtube.com/results?search_query=python+tutorial"},
    ],
    "javascript": [
        {"name": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"},
        {"name": "JavaScript.info", "url": "https://javascript.info"},
        {"name": "YouTube JS", "url": "https://www.youtube.com/results?search_query=javascript+tutorial"},
    ],
    "react": [
        {"name": "React Official Docs", "url": "https://react.dev"},
        {"name": "Coursera React", "url": "https://www.coursera.org/search?query=react"},
        {"name": "YouTube React", "url": "https://www.youtube.com/results?search_query=react+tutorial"},
    ],
    "typescript": [
        {"name": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/"},
        {"name": "Coursera TypeScript", "url": "https://www.coursera.org/search?query=typescript"},
        {"name": "YouTube TypeScript", "url": "https://www.youtube.com/results?search_query=typescript+tutorial"},
    ],
    "docker": [
        {"name": "Docker Official Docs", "url": "https://docs.docker.com/get-started/"},
        {"name": "Coursera Docker", "url": "https://www.coursera.org/search?query=docker"},
        {"name": "YouTube Docker", "url": "https://www.youtube.com/results?search_query=docker+tutorial"},
    ],
    "aws": [
        {"name": "AWS Free Training", "url": "https://aws.amazon.com/training/"},
        {"name": "Coursera AWS", "url": "https://www.coursera.org/search?query=aws"},
        {"name": "YouTube AWS", "url": "https://www.youtube.com/results?search_query=aws+tutorial"},
    ],
}


SKILL_REASONS = {
    "python": "Core language for scripting, automation, data processing, and backend development.",
    "javascript": "Essential for building interactive web UIs and full-stack applications.",
    "typescript": "Adds static typing to JavaScript, required for large-scale frontend/backend codebases.",
    "java": "Standard language for enterprise backends, Android, and distributed systems.",
    "c++": "Needed for high-performance systems, game engines, and embedded development.",
    "c#": "Primary language for .NET applications and Windows/Azure ecosystems.",
    "go": "Used for high-concurrency backend services, CLIs, and cloud-native tooling.",
    "rust": "Required for systems programming with memory safety guarantees.",
    "ruby": "Common in web development, especially with Rails-based applications.",
    "php": "Widely used for server-side web development and CMS platforms like WordPress.",
    "sql": "Fundamental for querying and managing relational databases.",
    "html": "Foundation of all web content structure.",
    "css": "Required for styling and laying out web interfaces.",
    "react": "Most popular library for building component-based UIs in modern web apps.",
    "vue": "Lightweight progressive framework for building web interfaces.",
    "angular": "Full-featured enterprise frontend framework by Google.",
    "next.js": "React framework for server-side rendering and production web apps.",
    "tailwindcss": "Utility-first CSS framework widely used for rapid UI development.",
    "redux": "State management library commonly paired with React applications.",
    "graphql": "Query language for APIs enabling flexible data fetching.",
    "node.js": "Runtime for server-side JavaScript; powers many backend APIs.",
    "express": "Minimal Node.js framework for building REST APIs.",
    "fastapi": "Modern Python framework for building high-performance APIs.",
    "django": "Full-featured Python web framework with built-in admin and ORM.",
    "flask": "Lightweight Python framework for microservices and small APIs.",
    "spring": "Enterprise Java framework for building scalable backend services.",
    "postgresql": "Advanced open-source relational database commonly used in production.",
    "mysql": "Widely used relational database for web applications.",
    "mongodb": "Document-oriented NoSQL database for flexible data storage.",
    "redis": "In-memory key-value store used for caching and real-time features.",
    "elasticsearch": "Search and analytics engine for full-text search and log analysis.",
    "dynamodb": "AWS managed NoSQL database for serverless and high-scale workloads.",
    "firebase": "Google platform for real-time databases, auth, and hosting.",
    "aws": "Leading cloud platform; most production infrastructure runs here.",
    "azure": "Microsoft cloud platform required for enterprise and .NET deployments.",
    "google cloud": "Google's cloud platform used for data, AI, and web services.",
    "docker": "Containerization tool essential for consistent deployment across environments.",
    "kubernetes": "Container orchestration system for deploying and scaling containerized apps.",
    "terraform": "Infrastructure-as-code tool for provisioning cloud resources.",
    "jenkins": "Popular CI/CD automation server for build and deployment pipelines.",
    "github actions": "CI/CD workflows built into GitHub for automating tests and deployments.",
    "ci/cd": "Automated pipelines for testing and deploying code continuously.",
    "git": "Version control system used in every modern software team.",
    "linux": "Operating system underlying most servers and cloud environments.",
    "machine learning": "Building predictive models and intelligent features from data.",
    "deep learning": "Neural network techniques powering modern AI applications.",
    "tensorflow": "Google's ML framework for training and deploying neural networks.",
    "pytorch": "Facebook's ML framework widely used in research and production.",
    "nlp": "Processing and understanding human language in AI applications.",
    "pandas": "Core Python library for data manipulation and analysis.",
    "numpy": "Fundamental package for numerical computing in Python.",
    "scikit-learn": "Standard Python library for classical machine learning algorithms.",
    "tableau": "Data visualization tool for business intelligence dashboards.",
    "power bi": "Microsoft's BI tool for creating interactive data reports.",
    "agile": "Project management methodology used in most modern software teams.",
    "scrum": "Agile framework for sprint-based iterative development.",
    "jira": "Project tracking tool used to manage tasks, sprints, and backlogs.",
    "microservices": "Architecture pattern for building scalable, independently deployable services.",
    "rest api": "Standard approach for building web service interfaces.",
    "figma": "Design tool required for collaborating with product and design teams.",
    "leadership": "Needed to guide team direction, mentor others, and drive decisions.",
    "communication": "Critical for cross-team collaboration, writing specs, and stakeholder updates.",
    "project management": "Required to plan, scope, and deliver software projects on schedule.",
    "react native": "Framework for building cross-platform mobile apps using React.",
    "flutter": "Google's UI toolkit for building native mobile and web apps.",
    "jest": "Testing framework standard in JavaScript/React projects.",
    "pytest": "Testing framework standard in Python projects.",
    "selenium": "Browser automation tool for end-to-end testing of web apps.",
    "cypress": "Modern end-to-end testing framework for web applications.",
}

def _get_skill_reason(skill: str, job_title: str = "") -> str:
    """Return a human-readable explanation of why a skill is needed for the role."""
    key = skill.lower()
    if key in SKILL_REASONS:
        return SKILL_REASONS[key]
    # Generic fallback
    role = f" for a {job_title} role" if job_title else ""
    return f"Listed as a required skill{role} — adding this to your profile will improve your match."


def cosine_similarity(vec1: list, vec2: list) -> float:
    a = np.array(vec1)
    b = np.array(vec2)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def get_resources(skill: str) -> list:
    key = skill.lower()
    return SPECIAL_RESOURCES.get(key, RESOURCE_MAP["default"](skill))


def analyze_gap(resume_skills: list[str], job_skills: list[str], job_title: str = "") -> dict:
    if not job_skills:
        return {
            "job_title": job_title,
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "partial_matches": [],
            "recommendations": [],
        }

    resume_lower = {s.lower(): s for s in resume_skills}
    job_lower = {s.lower(): s for s in job_skills}

    matched = []
    missing = []
    partial = []

    # Get embeddings for semantic comparison
    all_skills = list(set(list(resume_lower.keys()) + list(job_lower.keys())))
    embeddings_map = {}

    try:
        if len(all_skills) > 1:
            vectors = get_embeddings(all_skills)
            for i, skill in enumerate(all_skills):
                if i < len(vectors):
                    embeddings_map[skill] = vectors[i]
    except Exception:
        pass  # Fall back to exact matching only

    for job_skill_lower, job_skill_orig in job_lower.items():
        # Exact match
        if job_skill_lower in resume_lower:
            matched.append(job_skill_orig)
            continue

        # Semantic similarity
        best_sim = 0.0
        best_resume_skill = None

        if embeddings_map and job_skill_lower in embeddings_map:
            for res_skill_lower in resume_lower:
                if res_skill_lower in embeddings_map:
                    sim = cosine_similarity(embeddings_map[job_skill_lower], embeddings_map[res_skill_lower])
                    if sim > best_sim:
                        best_sim = sim
                        best_resume_skill = resume_lower[res_skill_lower]

        if best_sim >= 0.68:
            partial.append({
                "your_skill": best_resume_skill,
                "job_skill": job_skill_orig,
                "similarity": round(best_sim * 100, 1),
            })
        else:
            missing.append(job_skill_orig)

    total = len(job_skills)
    score = ((len(matched) + 0.5 * len(partial)) / total * 100) if total > 0 else 0

    # Assign priority by rank: first third = High, second third = Medium, rest = Low
    total_missing = len(missing)
    recommendations = []
    for i, skill in enumerate(missing):
        if total_missing <= 1:
            priority = "High"
        elif i < max(1, total_missing // 3):
            priority = "High"
        elif i < max(2, (total_missing * 2) // 3):
            priority = "Medium"
        else:
            priority = "Low"
        reason = _get_skill_reason(skill, job_title)
        recommendations.append({
            "skill": skill,
            "priority": priority,
            "reason": reason,
            "resources": get_resources(skill),
        })

    return {
        "job_title": job_title,
        "match_score": round(score, 1),
        "matched_skills": matched,
        "missing_skills": missing,
        "partial_matches": partial,
        "recommendations": recommendations,
    }
