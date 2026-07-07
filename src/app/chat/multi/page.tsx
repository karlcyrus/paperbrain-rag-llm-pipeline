'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import SourceCitation from '@/components/SourceCitation'
import EmptyState from '@/components/EmptyState'

interface Source {
  content: string
  similarity: number
  chunkIndex: number
  documentId?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface DocumentInfo {
  id: string
  name: string
  file_type: string
}

function MultiChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userEmail, setUserEmail] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const documentIds = searchParams.get('ids')?.split(',').filter(Boolean) || []

  const storageKey = `paperbrain-chat-multi-${documentIds.sort().join(',')}`

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      // Fetch document names
      try {
        const res = await fetch('/api/documents')
        if (res.ok) {
          const data = await res.json()
          const allDocs: DocumentInfo[] = data.documents || []
          const matched = allDocs.filter((d: DocumentInfo) => documentIds.includes(d.id))
          setDocuments(matched)
        }
      } catch {
        // ignore
      }

      // Load chat history from localStorage
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          setMessages(JSON.parse(stored))
        }
      } catch {
        // ignore
      }

      setPageLoading(false)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist messages to localStorage
  const persistMessages = useCallback((msgs: Message[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs))
    } catch {
      // ignore
    }
  }, [storageKey])

  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem(storageKey)
  }

  const getDocumentName = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    return doc?.name || `Doc ${docId.slice(0, 8)}`
  }

  const handleSend = async (question: string) => {
    const userMessage: Message = { role: 'user', content: question }
    const assistantMessage: Message = { role: 'assistant', content: '' }

    const newMessages = [...messages, userMessage, assistantMessage]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, documentIds }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        let errorMessage = errData.error || 'Failed to get response'
        if (res.status === 429) {
          errorMessage = 'The AI is rate limited. Please wait a moment and try again.'
        } else if (res.status === 503) {
          errorMessage = 'The AI service is temporarily busy. Please try again in a few seconds.'
        }
        throw new Error(errorMessage)
      }

      // Parse sources from header (base64 encoded)
      let sources: Source[] = []
      const sourcesHeader = res.headers.get('X-Sources')
      if (sourcesHeader) {
        try {
          sources = JSON.parse(atob(sourcesHeader))
        } catch {
          // Ignore parse errors
        }
      }

      // Read streaming response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let fullContent = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk

          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: fullContent,
            }
            return updated
          })
        }

        // Set final message with sources
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullContent,
            sources,
          }
          persistMessages(updated)
          return updated
        })
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`,
        }
        persistMessages(updated)
        return updated
      })
    }

    setLoading(false)
  }

  if (documentIds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No documents selected.</p>
          <Link href="/dashboard" className="text-[#2563eb] hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-[#2563eb] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar user={userEmail} />

      {/* Sub-header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#2563eb] transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm text-[#111827] dark:text-gray-100 font-medium truncate">
              Multi-Document Chat
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              ({documents.length} docs)
            </span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
            >
              Clear Chat
            </button>
          )}
        </div>
        {/* Document names */}
        {documents.length > 0 && (
          <div className="max-w-3xl mx-auto mt-2 flex flex-wrap gap-1.5">
            {documents.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 px-2 py-0.5 rounded-full"
              >
                {doc.name}
                <span className="text-blue-300 dark:text-blue-600 uppercase text-[10px]">{doc.file_type}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto chat-scroll">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                icon="💬"
                title="Ask a question across your documents"
                description="Type a question below and get AI-powered answers with source citations from all selected documents."
              />
            ) : (
              messages.map((msg, i) => (
                <div key={i}>
                  <ChatMessage role={msg.role} content={msg.content} />
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="ml-0 mt-1">
                      <SourceCitation
                        sources={msg.sources.map(s => ({
                          ...s,
                          documentName: s.documentId ? getDocumentName(s.documentId) : undefined,
                        }))}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={handleSend} disabled={loading} loading={loading} />
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function MultiChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-[#2563eb] animate-spin" />
      </div>
    }>
      <MultiChatContent />
    </Suspense>
  )
}
