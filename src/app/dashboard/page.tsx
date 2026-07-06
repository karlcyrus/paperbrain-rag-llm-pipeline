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
      }
    } catch {
      // Failed to delete
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14" />
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
    <div className="min-h-screen">
      <Navbar user={userEmail} />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Upload */}
        <section>
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Upload a Document</h2>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </section>

        {/* Documents */}
        <section>
          <h2 className="text-lg font-semibold text-[#111827] mb-4">
            Your Documents
            {documents.length > 0 && (
              <span className="text-sm font-normal text-gray-400 ml-2">({documents.length})</span>
            )}
          </h2>

          {documents.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No documents yet"
              description="Upload your first document above to get started with AI-powered Q&A."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
