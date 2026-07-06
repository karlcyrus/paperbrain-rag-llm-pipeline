'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Document {
  id: string
  name: string
  file_type: string
  created_at: string
}

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => void
}

const fileIcons: Record<string, string> = {
  pdf: '📄',
  txt: '📝',
  docx: '📃',
}

const fileColors: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700',
  txt: 'bg-green-50 text-green-700',
  docx: 'bg-blue-50 text-blue-700',
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const ext = document.file_type?.toLowerCase() || 'txt'
  const icon = fileIcons[ext] || '📄'
  const badgeColor = fileColors[ext] || 'bg-gray-50 text-gray-700'

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    onDelete(document.id)
  }

  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#111827] truncate" title={document.name}>
            {document.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
              {ext.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Link
          href={`/chat/${document.id}`}
          className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 transition-colors"
        >
          Chat
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer ${
            confirmDelete
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {deleting ? '...' : confirmDelete ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
