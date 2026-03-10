import { useState } from 'react'
import { SkillRadarChart, SkillBarChart } from './SkillChart'
import RecommendationCard from './RecommendationCard'
import HowItWorks from './HowItWorks'
import { RefreshCw } from 'lucide-react'

function ScoreCircle({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <svg width="140" height="140" className="-rotate-90 absolute inset-0">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-900">{score}%</span>
          <span className="text-xs text-gray-400">match</span>
        </div>
      </div>
    </div>
  )
}

function SkillTag({ skill, type, similarity }) {
  const styles = {
    matched: 'bg-green-50 text-green-700 border border-green-200',
    missing: 'bg-red-50 text-red-700 border border-red-200',
    partial: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  }
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${styles[type]}`}
      title={type === 'partial' ? `${similarity}% similar to your skill` : ''}
    >
      {skill}
      {type === 'partial' && <span className="ml-1 opacity-60">~{similarity}%</span>}
    </span>
  )
}

function JobResult({ result }) {
  return (
    <div className="space-y-6">
      {/* Score + Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Overall Match Score</h4>
          <div className="relative flex items-center justify-center">
            <ScoreCircle score={result.match_score} />
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">
            {result.matched_skills.length} matched · {result.partial_matches.length} partial · {result.missing_skills.length} missing
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Skills Breakdown</h4>
          <SkillBarChart
            matchedSkills={result.matched_skills}
            missingSkills={result.missing_skills}
            partialMatches={result.partial_matches}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Category Coverage</h4>
          <SkillRadarChart
            matchedSkills={result.matched_skills}
            missingSkills={result.missing_skills}
          />
        </div>
      </div>

      {/* Skill Tags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-green-800 mb-3">
            Matched Skills ({result.matched_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {result.matched_skills.length > 0 ? (
              result.matched_skills.map((s) => <SkillTag key={s} skill={s} type="matched" />)
            ) : (
              <p className="text-sm text-green-600 opacity-60">None matched</p>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-yellow-800 mb-3">
            Partial Matches ({result.partial_matches.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {result.partial_matches.length > 0 ? (
              result.partial_matches.map((p) => (
                <SkillTag key={p.job_skill} skill={p.job_skill} type="partial" similarity={p.similarity} />
              ))
            ) : (
              <p className="text-sm text-yellow-600 opacity-60">No partial matches</p>
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-3">
            Missing Skills ({result.missing_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {result.missing_skills.length > 0 ? (
              result.missing_skills.map((s) => <SkillTag key={s} skill={s} type="missing" />)
            ) : (
              <p className="text-sm text-red-600 opacity-60">No missing skills!</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Recommended Resources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.recommendations.map((r) => (
              <RecommendationCard key={r.skill} {...r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SkillGapResults({ results, onReset }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-gray-500 text-sm mt-1">
            Compared your resume against {results.length} job description{results.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Start Over
        </button>
      </div>

      {/* Tabs */}
      {results.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.job_title}
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  r.match_score >= 70
                    ? 'bg-green-100 text-green-700'
                    : r.match_score >= 40
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {r.match_score}%
              </span>
            </button>
          ))}
        </div>
      )}

      <JobResult result={results[activeTab]} />
      <HowItWorks />
    </div>
  )
}
