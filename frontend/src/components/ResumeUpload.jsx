import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '../api'
import { Upload, FileText, Loader2, Image as ImageIcon } from 'lucide-react'

const IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tif', '.tiff'],
}

export default function ResumeUpload({ onComplete }) {
  const [mode, setMode] = useState('upload')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [ocrStatus, setOcrStatus] = useState('')

  const processFile = async (file) => {
    setError('')
    setOcrStatus('')
    setLoading(true)
    setFileName(file.name)

    const isImage = file.type.startsWith('image/')
    if (isImage) {
      setOcrStatus('Running OCR on image — this may take ~30 seconds...')
    }

    const form = new FormData()
    form.append('file', file)
    try {
      const res = await api.post('/api/upload-resume', form)
      onComplete(res.data.skills, res.data.raw_text)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to parse file.')
    } finally {
      setLoading(false)
      setOcrStatus('')
    }
  }

  const processText = async () => {
    if (!text.trim()) return setError('Please paste your resume text.')
    setError('')
    setLoading(true)
    const form = new FormData()
    form.append('text', text)
    try {
      const res = await api.post('/api/upload-resume', form)
      onComplete(res.data.skills, res.data.raw_text)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to extract skills.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) processFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      ...IMAGE_TYPES,
    },
    multiple: false,
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
      <p className="text-gray-500 mb-6">We'll extract your skills automatically using AI.</p>

      <div className="flex gap-2 mb-6">
        {['upload', 'paste'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m === 'upload' ? 'Upload File' : 'Paste Text'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                <p className="text-gray-700 font-medium">Processing {fileName}...</p>
                {ocrStatus && (
                  <p className="text-gray-400 text-sm max-w-xs">{ocrStatus}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-gray-400" />
                <p className="text-gray-700 font-medium">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-gray-400 text-sm">PDF, DOCX, TXT</p>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Also supports images: JPG, PNG, BMP, WEBP, TIFF (OCR)
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={12}
            className="w-full border border-gray-300 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
          <button
            onClick={processText}
            disabled={loading}
            className="mt-3 w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting Skills...</> : <><FileText className="w-4 h-4" /> Extract Skills</>}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
