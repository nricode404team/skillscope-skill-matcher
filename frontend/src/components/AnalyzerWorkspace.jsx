import { useState } from 'react'
import api from '../api'
import StepIndicator from './StepIndicator'
import ResumeUpload from './ResumeUpload'
import JobDescriptionInput from './JobDescriptionInput'
import SkillGapResults from './SkillGapResults'
import HistoryPanel from './HistoryPanel'
import { useAnalysisHistory } from '../hooks/useAnalysisHistory'
import { Loader2 } from 'lucide-react'

export default function AnalyzerWorkspace() {
  const [step, setStep] = useState(1)
  const [resumeSkills, setResumeSkills] = useState([])
  const [resumeText, setResumeText] = useState('')
  const [jobs, setJobs] = useState([])
  const [results, setResults] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const { history, addEntry, removeEntry, clearHistory } = useAnalysisHistory()

  const handleResumeComplete = (skills, text) => {
    setResumeSkills(skills)
    setResumeText(text)
    setStep(2)
  }

  const handleAnalyze = async () => {
    setAnalyzeError('')
    setAnalyzing(true)
    try {
      const payload = {
        resume_skills: resumeSkills,
        jobs: jobs.map((j) => ({ title: j.title, skills: j.skills })),
      }
      const res = await api.post('/api/analyze', payload)
      const newResults = res.data.results
      setResults(newResults)
      addEntry({ resumeSkills, resumeText, jobs, results: newResults })
      setStep(3)
    } catch (e) {
      setAnalyzeError(e.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setResumeSkills([])
    setResumeText('')
    setJobs([])
    setResults([])
    setAnalyzeError('')
  }

  const handleRestoreHistory = (entry) => {
    setResumeSkills(entry.resumeSkills || [])
    setResumeText(entry.resumeText || '')
    setJobs(entry.jobs || [])
    setResults(entry.results || [])
    setStep(3)
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Dashboard sub-header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Resume Skill Gap Analyzer &mdash; powered by HuggingFace AI
          </p>
          <HistoryPanel
            history={history}
            onRestore={handleRestoreHistory}
            onRemove={removeEntry}
            onClear={clearHistory}
          />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {step < 3 && <StepIndicator currentStep={step} />}

        {step === 1 && <ResumeUpload onComplete={handleResumeComplete} />}

        {step === 2 && (
          <>
            <div className="max-w-2xl mx-auto mb-6 bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">
                Resume: {resumeSkills.length} skills extracted
              </p>
              <div className="flex flex-wrap gap-1.5">
                {resumeSkills.slice(0, 20).map((s) => (
                  <span key={s} className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
                {resumeSkills.length > 20 && (
                  <span className="text-xs text-green-600">+{resumeSkills.length - 20} more</span>
                )}
              </div>
            </div>

            <JobDescriptionInput
              jobs={jobs}
              setJobs={setJobs}
              onNext={handleAnalyze}
              onBack={() => setStep(1)}
            />

            {analyzing && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                  <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
                  <p className="font-semibold text-slate-900">Analyzing skill gaps...</p>
                  <p className="text-sm text-slate-500">Running AI-powered analysis</p>
                </div>
              </div>
            )}

            {analyzeError && (
              <div className="max-w-2xl mx-auto mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                {analyzeError}
              </div>
            )}
          </>
        )}

        {step === 3 && results.length > 0 && <SkillGapResults results={results} onReset={handleReset} />}
      </main>
    </div>
  )
}
