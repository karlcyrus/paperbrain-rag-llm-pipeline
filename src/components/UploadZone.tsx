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
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-3 border-gray-200 dark:border-gray-600 border-t-[#2563eb] animate-spin" />
            <p className="text-sm font-medium text-[#111827] dark:text-gray-100">{statusMessage}</p>
            <div className="progress-bar max-w-xs mx-auto">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#111827] dark:text-gray-100">
              {isDragActive ? 'Drop your file here' : 'Drag & drop a document, or click to browse'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">PDF, TXT, or DOCX — up to 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400 text-center animate-fade-in">
          {error}
        </div>
      )}
    </div>
  )
}
