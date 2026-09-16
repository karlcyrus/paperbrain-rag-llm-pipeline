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
      className={`bg-white/80 dark:bg-zinc-900/40 backdrop-blur-sm rounded-xl border p-5 shadow-sm hover:shadow-lg dark:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 dark:hover:shadow-2xl'
      }`}
    >
      <div className="flex items-start gap-4">
        {selectable && (
          <label className="flex items-center mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selected || false}
              onChange={() => onToggleSelect?.(document.id)}
              className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-zinc-950 cursor-pointer accent-blue-500 transition-colors duration-300"
            />
          </label>
        )}
        <span className="text-2xl flex-shrink-0 drop-shadow-sm dark:drop-shadow-md">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate tracking-tight transition-colors duration-300" title={document.name}>
            {document.name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm transition-colors duration-300 ${badgeColor}`}>
              {ext.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-500 font-light transition-colors duration-300">{formattedDate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5">
        <Link
          href={`/chat/${document.id}`}
          className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-blue-600 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-blue-700 dark:hover:bg-white transition-colors shadow-md dark:shadow-lg shadow-blue-500/20 dark:shadow-white/5"
        >
          Chat
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer border ${
            confirmDelete
              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
              : 'bg-gray-50 dark:bg-zinc-950 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200 hover:border-gray-300 dark:hover:border-zinc-700'
          } disabled:opacity-50`}
        >
          {deleting ? '...' : confirmDelete ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
