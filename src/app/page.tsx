'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// Unique Particle System: Floating data symbols instead of generic dots
const TechParticles = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, left: string, duration: string, delay: string, symbol: string, size: string}>>([]);

  useEffect(() => {
    // Using standard ASCII to prevent encoding bugs
    const symbols = ['+', '-', 'x', '/', '[ ]', '{ }', '< >'];
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 25 + 20}s`, // Very slow upward drift
      delay: `-${Math.random() * 25}s`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() > 0.5 ? 'text-sm' : 'text-xs'
    }));
    setParticles(newParticles);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute bottom-[-10%] ${p.size} text-gray-300 dark:text-zinc-400/50 font-mono select-none transition-colors duration-300`}
          style={{
            left: p.left,
            animation: `floatUpData ${p.duration} linear infinite`,
            animationDelay: p.delay,
          }}
        >
          {p.symbol}
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUpData {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
      `}} />
    </div>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-zinc-800 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Layer (z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <TechParticles />
        {/* Subtle Top Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 dark:from-white/10 via-gray-50/0 dark:via-zinc-950/0 to-transparent transition-colors duration-300" />
        {/* Minimal Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] transition-colors duration-300" />
      </div>

      {/* Foreground Content Layer (z-10) */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        
        <div>
          {/* Hero Section */}
          <div className="relative max-w-5xl mx-auto px-4 pt-32 pb-20 text-center">
            <div className="inline-flex items-center gap-2 border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-gray-700 dark:text-zinc-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8 transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Next-Gen Document Intelligence</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight leading-[1.1] mb-6 transition-colors duration-300">
              Unlock the knowledge inside your <br className="hidden sm:block" />
              <span className="text-gray-500 dark:text-zinc-400">documents instantly.</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light transition-colors duration-300">
              Stop searching through endless pages. Upload your PDFs or Word files and let our AI find exact answers with verified citations in seconds.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group w-full sm:w-auto px-8 py-3 rounded-md bg-blue-600 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-blue-700 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 dark:shadow-white/5"
              >
                Start Chatting
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3 rounded-md bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors border border-gray-200 dark:border-zinc-800 text-center shadow-lg shadow-black/5 dark:shadow-black/20"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Clean Feature Cards */}
          <div className="relative max-w-5xl mx-auto px-4 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-8 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors backdrop-blur-sm shadow-sm dark:shadow-none">
                <svg className="w-6 h-6 text-gray-700 dark:text-zinc-300 mb-6 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-2 transition-colors duration-300">Instant Indexing</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed font-light transition-colors duration-300">
                  Drag and drop massive PDFs or Word files. Our pipeline processes and indexes everything locally.
                </p>
              </div>

              <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-8 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors backdrop-blur-sm shadow-sm dark:shadow-none">
                <svg className="w-6 h-6 text-gray-700 dark:text-zinc-300 mb-6 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-2 transition-colors duration-300">Contextual AI</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed font-light transition-colors duration-300">
                  Ask complex, nuanced questions. The system understands context and synthesizes answers naturally.
                </p>
              </div>

              <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-8 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors backdrop-blur-sm shadow-sm dark:shadow-none">
                <svg className="w-6 h-6 text-gray-700 dark:text-zinc-300 mb-6 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-2 transition-colors duration-300">Verified Citations</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed font-light transition-colors duration-300">
                  Every single response includes exact source citations linked directly to your uploaded document.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-zinc-800/50 py-8 text-center text-xs text-gray-500 dark:text-zinc-500 w-full bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm transition-colors duration-300">
          PaperBrain System
        </div>
      </div>
    </div>
  )
}
