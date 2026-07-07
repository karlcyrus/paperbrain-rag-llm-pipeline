'use client'

import { useState } from 'react'

interface Source {
  content: string
  similarity: number
  chunkIndex: number
  documentId?: string
  documentName?: string
}

interface SourceCitationProps {
  sources: Source[]
}

export default function SourceCitation({ sources }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false)

  if (!sources || sources.length === 0) return null

  return (
    <div className="animate-fade-in mt-2 ml-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-medium text-[#2563eb] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        View Sources ({sources.length})
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {sources.map((source, i) => (
            <div key={i} className="source-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Chunk #{source.chunkIndex + 1}
                  {source.documentName && (
                    <span className="text-gray-400 dark:text-gray-500 ml-1">
                      • {source.documentName}
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-[#2563eb] dark:text-blue-400">
                  {(source.similarity * 100).toFixed(1)}% match
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {source.content.length > 300
                  ? source.content.slice(0, 300) + '…'
                  : source.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
