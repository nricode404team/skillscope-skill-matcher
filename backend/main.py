from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, jobs, analyze

app = FastAPI(title="Resume Skill Gap Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(analyze.router)


@app.get("/")
def root():
    return {"message": "Resume Skill Gap Analyzer API is running"}
