import { useState } from 'react'
import { History, Trash2, ChevronRight, X, Clock, Briefcase, BarChart2 } from 'lucide-react'

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

function ScoreBadge({ score }) {
  const color =
    score >= 70
      ? 'bg-green-100 text-green-700'
      : score >= 40
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}%
    </span>
  )
}

export default function HistoryPanel({ history, onRestore, onRemove, onClear }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all"
      >
        <History className="w-4 h-4" />
        History
        {history.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {history.length}
          </span>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-700" />
                <h2 className="font-bold text-gray-900">Analysis History</h2>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={() => { onClear(); setOpen(false) }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 px-8 text-center">
                  <History className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No analyses saved yet.</p>
                  <p className="text-xs">Complete an analysis and it will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {history.map((entry) => (
                    <li key={entry.id} className="group px-5 py-4 hover:bg-gray-50 transition-colors">
                      {/* Date + delete */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.date)}
                        </span>
                        <button
                          onClick={() => onRemove(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Jobs & scores */}
                      <div className="space-y-1.5 mb-3">
                        {entry.results.map((r, i) => (
                          <div key={i} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800 truncate">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{r.job_title}</span>
                            </span>
                            <ScoreBadge score={r.match_score} />
                          </div>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <BarChart2 className="w-3 h-3" />
                          {entry.resumeSkillCount} resume skills
                        </span>
                        <button
                          onClick={() => { onRestore(entry); setOpen(false) }}
                          className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-all"
                        >
                          View results
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
