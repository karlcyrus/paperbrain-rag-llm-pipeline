'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-[#2563eb] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563eb] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>🧠</span>
          <span>AI-Powered Document Q&A</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] tracking-tight leading-tight">
          Chat with your
          <br />
          <span className="text-[#2563eb]">documents</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Upload PDFs, text files, or Word documents and ask questions.
          PaperBrain uses AI to find relevant passages and give you accurate, cited answers.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl bg-[#2563eb] text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-white text-[#111827] font-medium hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4">
              📤
            </div>
            <h3 className="text-base font-semibold text-[#111827] mb-2">Upload Documents</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Drag and drop your PDFs, text files, or Word documents. We parse and index them instantly.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h3 className="text-base font-semibold text-[#111827] mb-2">Ask Questions</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Type natural language questions about your documents. Our AI understands context and nuance.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl mb-4">
              📎
            </div>
            <h3 className="text-base font-semibold text-[#111827] mb-2">Get Cited Answers</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every answer includes source citations so you can verify the information directly.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        PaperBrain — AI document intelligence
      </div>
    </div>
  )
}
