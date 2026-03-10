const featureGroups = [
  {
    title: 'Input Sources',
    points: [
      'Resume upload and text extraction',
      'Job analysis from URL, pasted text, or image OCR',
      'Support for analyzing up to 5 job postings at once',
    ],
  },
  {
    title: 'Analysis Engine',
    points: [
      'Exact skill matching plus semantic partial matching',
      'Per-job match score with visual breakdown charts',
      'Missing skill detection with practical recommendations',
    ],
  },
  {
    title: 'Workflow',
    points: [
      'Three-step guided analyzer flow',
      'Saved analysis history for quick comparison',
      'Start-over and rerun support to iterate quickly',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Features</h1>
      <p className="mt-3 text-slate-600 max-w-3xl">
        Everything in the app is optimized for one goal: quickly understanding job-fit gaps and what to improve next.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {featureGroups.map((group) => (
          <section key={group.title} className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {group.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
