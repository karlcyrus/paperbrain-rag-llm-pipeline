'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// Shared background component (Particles, Grid, Spotlight)
const TechBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, left: string, duration: string, delay: string, symbol: string, size: string}>>([]);

  useEffect(() => {
    const symbols = ['+', '-', 'x', '/', '[ ]', '{ }', '< >'];
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 25 + 20}s`,
      delay: `-${Math.random() * 25}s`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() > 0.5 ? 'text-sm' : 'text-xs'
    }));
    setParticles(newParticles);
    setMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className={`absolute bottom-[-10%] ${p.size} text-zinc-400/50 font-mono select-none`}
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
      )}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-zinc-950/0 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px]" />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-zinc-800 relative overflow-hidden flex items-center justify-center px-4">
      
      <TechBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-zinc-100 tracking-tight hover:text-white transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>PaperBrain</span>
          </Link>
          <p className="mt-2 text-sm text-zinc-400 font-light">Create your account</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 placeholder:text-zinc-600 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 placeholder:text-zinc-600 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-2 font-light">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3 animate-fade-in font-light">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              Create Account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-300 font-medium hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
