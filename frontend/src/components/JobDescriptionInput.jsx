import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '../api'
import { Plus, Trash2, Loader2, Link, FileText, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react'

const IMAGE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tif', '.tiff'],
}

function JobCard({ job, index, onRemove }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{job.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{job.skills.length} skills extracted</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-700">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.map((s) => (
            <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ImageDropzone({ onImageProcessed, title, loading, setLoading, setError }) {
  const [ocrStatus, setOcrStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const processImage = async (file) => {
    setError('')
    setOcrStatus('Running OCR on image — this may take ~30 seconds...')
    setLoading(true)
    setPreviewUrl(URL.createObjectURL(file))
    const form = new FormData()
    form.append('file', file)
    if (title) form.append('title', title)
    try {
      const res = await api.post('/api/fetch-job-image', form)
      onImageProcessed(res.data.skills, res.data.raw_text, res.data.title)
    } catch (e) {
      setError(e.response?.data?.detail || 'Image OCR failed.')
    } finally {
      setLoading(false)
      setOcrStatus('')
    }
  }

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) processImage(accepted[0])
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: IMAGE_ACCEPT,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-500">{ocrStatus || 'Processing image...'}</p>
        </div>
      ) : previewUrl ? (
        <div className="flex flex-col items-center gap-2">
          <img src={previewUrl} alt="preview" className="max-h-24 rounded-lg object-contain" />
          <p className="text-xs text-gray-400">Drop another image to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-600 font-medium">
            {isDragActive ? 'Drop image here' : 'Drag & drop a job screenshot'}
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, BMP, WEBP, TIFF — text will be extracted via OCR</p>
        </div>
      )}
    </div>
  )
}

export default function JobDescriptionInput({ jobs, setJobs, onNext, onBack }) {
  const [mode, setMode] = useState('url')
  const [input, setInput] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addJob = async () => {
    if (!input.trim()) return setError('Please enter a URL or job description text.')
    setError('')
    setLoading(true)
    try {
      const payload = mode === 'url' ? { url: input } : { text: input }
      const res = await api.post('/api/fetch-job', payload)
      setJobs((prev) => [
        ...prev,
        {
          title: title || `Job ${prev.length + 1}`,
          skills: res.data.skills,
          raw_text: res.data.raw_text,
        },
      ])
      setInput('')
      setTitle('')
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to fetch job description.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageProcessed = (skills, raw_text, imageTitle) => {
    setJobs((prev) => [
      ...prev,
      {
        title: title || imageTitle || `Job ${prev.length + 1}`,
        skills,
        raw_text,
      },
    ])
    setTitle('')
  }

  const removeJob = (index) => {
    setJobs((prev) => prev.filter((_, i) => i !== index))
  }

  const tabs = [
    { id: 'url', label: 'Paste URL', icon: <Link className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Paste Text', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'image', label: 'Upload Image', icon: <ImageIcon className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Job Descriptions</h2>
      <p className="text-gray-500 mb-6">Add up to 5 job postings to compare against your resume.</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === t.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title (optional, e.g. Frontend Developer)"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />

        {mode === 'image' ? (
          <ImageDropzone
            onImageProcessed={handleImageProcessed}
            title={title}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
          />
        ) : mode === 'url' ? (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://jobs.example.com/frontend-developer"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        ) : (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the job description here..."
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {mode !== 'image' && (
          <button
            onClick={addJob}
            disabled={loading || jobs.length >= 5}
            className="mt-4 w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Fetching skills...</>
            ) : (
              <><Plus className="w-4 h-4" /> Add Job Description</>
            )}
          </button>
        )}

        {jobs.length >= 5 && (
          <p className="text-xs text-gray-400 text-center mt-2">Maximum 5 job descriptions reached.</p>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="space-y-3 mb-6">
          {jobs.map((job, i) => (
            <JobCard key={i} job={job} index={i} onRemove={removeJob} />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={jobs.length === 0}
          className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          Analyze Gaps →
        </button>
      </div>
    </div>
  )
}
