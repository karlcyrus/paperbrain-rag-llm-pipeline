'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
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
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

export default function ChatPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = use(params)
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')
      setPageLoading(false)
    }

    init()
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (question: string) => {
    const userMessage: Message = { role: 'user', content: question }
    const assistantMessage: Message = { role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, documentIds: [documentId] }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to get response')
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
        return updated
      })
    }

    setLoading(false)
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-[#2563eb] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userEmail} />

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-[#2563eb] transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-[#111827] font-medium truncate">
            Document Chat
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto chat-scroll">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                icon="💬"
                title="Ask a question about your document"
                description="Type a question below and get AI-powered answers with source citations."
              />
            ) : (
              messages.map((msg, i) => (
                <div key={i}>
                  <ChatMessage role={msg.role} content={msg.content} />
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="ml-0 mt-1">
                      <SourceCitation sources={msg.sources} />
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
