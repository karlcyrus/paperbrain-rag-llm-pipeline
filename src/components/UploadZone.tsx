'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadZoneProps {
  onUploadComplete: (doc: { documentId: string; name: string; chunkCount: number }) => void
}

const PROCESSING_MESSAGES = [
  'Parsing document...',
  'Generating embeddings...',
  'Almost done...',
]

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError('')
    setProgress(0)
    setStatusMessage(PROCESSING_MESSAGES[0])

    const formData = new FormData()
    formData.append('file', file)

    // Simulate progress stages while upload + processing happens
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setStatusMessage(PROCESSING_MESSAGES[0])
          return prev + 5
        }
        if (prev < 60) {
          setStatusMessage(PROCESSING_MESSAGES[1])
          return prev + 3
        }
        if (prev < 85) {
          setStatusMessage(PROCESSING_MESSAGES[2])
          return prev + 2
        }
        return prev
      })
    }, 400)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Upload failed')
      }

      setProgress(100)
      setStatusMessage('Done!')

      const data = await res.json()
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
        setStatusMessage('')
        onUploadComplete(data)
      }, 600)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
      setStatusMessage('')
    }
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
    onDropRejected: (rejections) => {
      const rejection = rejections[0]
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError('File too large. Maximum size is 10MB.')
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PDF, TXT, or DOCX files.')
      } else {
        setError('File rejected. Please try again.')
      }
    },
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed rounded-xl p-10 sm:p-14 text-center transition-all duration-300 cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/5'
            : 'border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:bg-gray-50 dark:hover:bg-zinc-900/60 hover:border-gray-400 dark:hover:border-zinc-700'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-gray-200 dark:border-zinc-800 border-t-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-300">{statusMessage}</p>
            <div className="w-full max-w-xs mx-auto h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-500 font-mono">{progress}%</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-400 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-zinc-200 transition-colors duration-300">
              {isDragActive ? 'Drop your file here' : 'Drag & drop a document, or click to browse'}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-500 font-light transition-colors duration-300">PDF, TXT, or DOCX — up to 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 dark:text-red-400 text-center animate-fade-in bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 py-2 rounded-lg max-w-md mx-auto transition-colors duration-300">
          {error}
        </div>
      )}
    </div>
  )
}
