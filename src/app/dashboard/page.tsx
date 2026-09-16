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
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 border-b border-gray-200/50 dark:border-zinc-800/50 h-14" />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="animate-skeleton h-32 rounded-xl bg-gray-200 dark:bg-zinc-900/50" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-skeleton h-36 rounded-xl bg-gray-200 dark:bg-zinc-900/50" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-zinc-800 relative transition-colors duration-300">
      {/* Subtle Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 dark:from-blue-900/10 via-gray-50/0 dark:via-zinc-950/0 to-transparent transition-colors duration-300" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] transition-colors duration-300" />
      </div>

      <div className="relative z-10">
        <Navbar user={userEmail} />

        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
          {/* Upload */}
          <section>
            <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100 mb-6 tracking-tight transition-colors duration-300">Upload a Document</h2>
            <UploadZone onUploadComplete={handleUploadComplete} />
          </section>

          {/* Documents */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100 tracking-tight transition-colors duration-300">
                Your Documents
                {documents.length > 0 && (
                  <span className="text-sm font-light text-gray-500 dark:text-zinc-500 ml-3 transition-colors duration-300">({documents.length})</span>
                )}
              </h2>
              {selectedIds.size >= 2 && (
                <button
                  onClick={handleChatWithSelected}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-blue-700 dark:hover:bg-white transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/20 dark:shadow-white/5"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    </div>
  )
}
