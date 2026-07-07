'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import UploadZone from '@/components/UploadZone'
import DocumentCard from '@/components/DocumentCard'
import EmptyState from '@/components/EmptyState'

interface Document {
  id: string
  name: string
  file_type: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      try {
        const res = await fetch('/api/documents')
        if (res.ok) {
          const data = await res.json()
          setDocuments(data.documents || [])
        }
      } catch {
        // Failed to fetch documents
      }

      setLoading(false)
    }

    init()
  }, [router])

  const handleUploadComplete = (doc: { documentId: string; name: string; chunkCount: number }) => {
    const newDoc: Document = {
      id: doc.documentId,
      name: doc.name,
      file_type: doc.name.split('.').pop() || 'txt',
      created_at: new Date().toISOString(),
    }
    setDocuments((prev) => [newDoc, ...prev])
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch {
      // Failed to delete
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleChatWithSelected = () => {
    const ids = Array.from(selectedIds).join(',')
    router.push(`/chat/multi?ids=${ids}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gray-900">
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-14" />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="animate-skeleton h-32 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-skeleton h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <Navbar user={userEmail} />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Upload */}
        <section>
          <h2 className="text-lg font-semibold text-[#111827] dark:text-gray-100 mb-4">Upload a Document</h2>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </section>

        {/* Documents */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111827] dark:text-gray-100">
              Your Documents
              {documents.length > 0 && (
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">({documents.length})</span>
              )}
            </h2>
            {selectedIds.size >= 2 && (
              <button
                onClick={handleChatWithSelected}
                className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with Selected ({selectedIds.size})
              </button>
            )}
          </div>

          {documents.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No documents yet"
              description="Upload your first document above to get started with AI-powered Q&A."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                  selectable
                  selected={selectedIds.has(doc.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
