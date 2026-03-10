import { ExternalLink, BookOpen } from 'lucide-react'

const priorityColors = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
}

const priorityDot = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-400',
  Low: 'bg-blue-400',
}

export default function RecommendationCard({ skill, priority, reason, resources }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="font-semibold text-gray-900">{skill}</span>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${priorityColors[priority] || priorityColors.Low}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[priority] || priorityDot.Low}`} />
          {priority} Priority
        </span>
      </div>

      {reason && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed pl-6">{reason}</p>
      )}

      <div className="space-y-2 pl-6">
        {resources.map((r, i) => (
          <a
            key={i}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            {r.name}
          </a>
        ))}
      </div>
    </div>
  )
}
