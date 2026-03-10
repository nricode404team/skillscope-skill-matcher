export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight">About</h1>
      <p className="mt-4 text-slate-600 leading-7">
        This project helps candidates understand where their resumes align with target roles and where they do not.
        The analyzer combines rule-based extraction, model-based entity recognition, and similarity scoring to produce
        practical outcomes instead of generic feedback.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">What makes it useful</h2>
          <p className="mt-2 text-sm text-slate-600">
            Instead of a one-off score, you can compare multiple job descriptions side-by-side and identify repeated
            missing skills to prioritize your learning plan.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Who it is for</h2>
          <p className="mt-2 text-sm text-slate-600">
            Job seekers, career switchers, and students preparing resumes for specific roles in software, data, and
            technical product teams.
          </p>
        </article>
      </div>
    </div>
  )
}
