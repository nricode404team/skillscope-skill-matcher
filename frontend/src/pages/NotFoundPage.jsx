import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
        <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
