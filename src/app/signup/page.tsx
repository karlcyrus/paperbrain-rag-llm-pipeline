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
      )}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 dark:from-white/10 via-gray-50/0 dark:via-zinc-950/0 to-transparent transition-colors duration-300" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] transition-colors duration-300" />
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

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) setError(error.message)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-zinc-800 relative overflow-hidden flex items-center justify-center px-4 transition-colors duration-300">
      
      <TechBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight hover:opacity-80 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>PaperBrain</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 font-light transition-colors duration-300">Create your account</p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800/50 shadow-xl dark:shadow-2xl p-6 sm:p-8 transition-colors duration-300">
          <div className="space-y-4 mb-5">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3 rounded-lg bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-zinc-800/50"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-zinc-500 text-xs uppercase font-medium tracking-wider">Or email</span>
              <div className="flex-grow border-t border-gray-200 dark:border-zinc-800/50"></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 transition-colors duration-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-zinc-500 focus:border-blue-500 dark:focus:border-zinc-500 placeholder:text-gray-400 dark:placeholder:text-zinc-600 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 transition-colors duration-300">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-zinc-500 focus:border-blue-500 dark:focus:border-zinc-500 placeholder:text-gray-400 dark:placeholder:text-zinc-600 transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 font-light transition-colors duration-300">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-4 py-3 animate-fade-in font-light transition-colors duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-blue-700 dark:hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-md dark:shadow-none"
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

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-zinc-500 transition-colors duration-300">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 dark:text-zinc-300 font-medium hover:text-blue-700 dark:hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
