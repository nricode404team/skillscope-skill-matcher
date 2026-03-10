import { Link } from 'react-router-dom'
import {
  Sparkles,
  BarChart3,
  ShieldCheck,
  UploadCloud,
  ScanSearch,
  ListChecks,
  TrendingUp,
  Users,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const highlights = [
  {
    icon: BarChart3,
    title: 'Data-backed skill scoring',
    description:
      'Compare your resume against multiple roles and view clear match percentages.',
  },
  {
    icon: Sparkles,
    title: 'AI extraction pipeline',
    description:
      'Detect skills from resumes and job posts using OCR, NER, and semantic matching.',
  },
  {
    icon: ShieldCheck,
    title: 'Focused recommendations',
    description:
      'Get prioritised learning suggestions to close the most important skill gaps first.',
  },
]

const steps = [
  {
    icon: UploadCloud,
    step: '01',
    title: 'Upload your resume',
    description:
      'Drop a PDF or paste plain text. Our AI extracts every skill automatically — no manual tagging required.',
  },
  {
    icon: ScanSearch,
    step: '02',
    title: 'Add job descriptions',
    description:
      'Paste one or more job postings. SkillScope parses each role and maps required skills in seconds.',
  },
  {
    icon: ListChecks,
    step: '03',
    title: 'Review your gap analysis',
    description:
      'See a ranked breakdown of which skills you have, which you\'re missing, and how close you are to each role.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Act on recommendations',
    description:
      'Follow a personalised action plan — courses, projects, and certifications that move the needle fastest.',
  },
]

const stats = [
  { value: '95%', label: 'Skill extraction accuracy' },
  { value: '<10s', label: 'Average analysis time' },
  { value: '50+', label: 'Supported file formats' },
  { value: '100%', label: 'Privacy-first — no data stored' },
]

const features = [
  { icon: Zap, text: 'Instant skill extraction from any resume format' },
  { icon: FileText, text: 'Supports PDF, DOCX, and plain text' },
  { icon: BarChart3, text: 'Side-by-side match scores for multiple jobs' },
  { icon: Users, text: 'Built for job seekers, recruiters, and career coaches' },
  { icon: ShieldCheck, text: 'Zero sign-up required — works entirely in-browser' },
  { icon: Sparkles, text: 'Powered by HuggingFace transformer models' },
]

const testimonials = [
  {
    quote:
      'I was applying to roles blindly until SkillScope showed me exactly which skills were holding me back. Landed my first ML role within 8 weeks.',
    name: 'Priya S.',
    role: 'ML Engineer',
  },
  {
    quote:
      'As a career coach I use this with every client. It saves hours of manual gap analysis and gives concrete, defensible recommendations.',
    name: 'Marcus L.',
    role: 'Career Coach',
  },
  {
    quote:
      'The multi-job comparison is killer. I could see at a glance that one role was an 80% match while another was only 45%.',
    name: 'Yuki T.',
    role: 'Senior Product Designer',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="bg-[radial-gradient(circle_at_20%_10%,#fef3c7_0%,#ffffff_40%,#e0e7ff_100%)]">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full bg-slate-900 text-white text-xs px-3 py-1 mb-5">
              Resume Skill Gap Analyzer
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Build a targeted career plan from every job description.
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl">
              Upload your resume, analyze real openings, and understand which skills to prioritise next — powered by open-source AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="px-5 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 font-medium hover:bg-white transition-colors"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <article key={item.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Four steps from resume to action plan — no sign-up, no fluff.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <span className="absolute top-4 right-4 text-3xl font-bold text-slate-100 select-none">{s.step}</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature list ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to close the gap
            </h2>
            <p className="text-slate-500 mb-8">
              SkillScope handles the heavy lifting so you can focus on actually learning the right skills.
            </p>
            <ul className="space-y-4">
              {features.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-green-50 text-green-600 grid place-items-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700 text-sm">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-900 text-sm">Sample match result</span>
            </div>
            {[
              { role: 'Frontend Engineer', pct: 82, color: 'bg-green-500' },
              { role: 'Full-Stack Developer', pct: 67, color: 'bg-yellow-400' },
              { role: 'ML Ops Engineer', pct: 38, color: 'bg-red-400' },
            ].map((r) => (
              <div key={r.role}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{r.role}</span>
                  <span className="font-medium">{r.pct}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">What people are saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <p className="text-slate-700 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <footer className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 grid place-items-center text-slate-600 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to see where you stand?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            No account required. Upload your resume and get a full gap analysis in seconds.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors text-base"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
