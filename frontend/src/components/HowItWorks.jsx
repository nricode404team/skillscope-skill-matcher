import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const sections = [
  {
    title: '1. How skills are extracted',
    content: `Your resume and job descriptions are sent to HuggingFace's BERT-based Named Entity Recognition (NER) model. This model reads the text and identifies skill-related tokens — programming languages, tools, frameworks, and more. These are combined with a curated keyword library to ensure comprehensive coverage.`,
  },
  {
    title: '2. How matching works',
    content: `First, we check for exact matches (case-insensitive). For non-exact matches, we use the sentence-transformers model to convert each skill into a numerical vector (embedding). We then measure how "close" two skill vectors are using cosine similarity — a score between 0 and 1. A score above 0.85 means the skills are semantically similar (e.g., "JS" and "JavaScript"), resulting in a partial match.`,
  },
  {
    title: '3. How the match score is calculated',
    content: `Match Score = (Matched Skills + 0.5 × Partial Matches) ÷ Total Required Skills × 100\n\nFor example: if a job requires 10 skills, you have 6 exact matches and 2 partial matches, your score = (6 + 0.5×2) / 10 × 100 = 70%.`,
  },
  {
    title: '4. What partial matches mean',
    content: `Partial matches are skills that are semantically related but not identically worded. Examples: "JS" ↔ "JavaScript", "ML" ↔ "Machine Learning", "Postgres" ↔ "PostgreSQL". These count as half a matched skill in the score. We show them in yellow so you know to update your resume wording for clarity.`,
  },
  {
    title: '5. How recommendations are prioritized',
    content: `Missing skills are marked as High, Medium, or Low priority based on how many of your missing skills there are. If you're missing 3 or fewer, they're all High priority. Up to 6 = Medium. Beyond that = Low. This helps you focus on the most impactful skills to learn first.`,
  },
]

export default function HowItWorks() {
  const [open, setOpen] = useState(null)

  return (
    <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">How the Algorithm Works</h3>
        <p className="text-sm text-gray-500">Understand how we analyze your skills</p>
      </div>
      <div className="divide-y divide-gray-100">
        {sections.map((s, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-all"
            >
              <span className="font-medium text-gray-800 text-sm">{s.title}</span>
              {open === i ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {open === i && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{s.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
