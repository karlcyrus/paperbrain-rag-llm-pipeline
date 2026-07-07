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
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

const fileIcons: Record<string, string> = {
  pdf: '📄',
  txt: '📝',
  docx: '📃',
}

const fileColors: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  txt: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  docx: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function DocumentCard({ document, onDelete, selectable, selected, onToggleSelect }: DocumentCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const ext = document.file_type?.toLowerCase() || 'txt'
  const icon = fileIcons[ext] || '📄'
  const badgeColor = fileColors[ext] || 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'

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
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in ${
        selected
          ? 'border-[#2563eb] ring-2 ring-blue-200 dark:ring-blue-800'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {selectable && (
          <label className="flex items-center mt-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selected || false}
              onChange={() => onToggleSelect?.(document.id)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer accent-[#2563eb]"
            />
          </label>
        )}
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-gray-100 truncate" title={document.name}>
            {document.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
              {ext.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{formattedDate}</span>
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
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          {deleting ? '...' : confirmDelete ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
