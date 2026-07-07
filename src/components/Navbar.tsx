'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ThemeToggle from './ThemeToggle'

interface NavbarProps {
  user: string
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-[#111827] dark:text-gray-100">
              <span>🧠</span>
              <span className="hidden sm:inline">PaperBrain</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors hidden sm:inline"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline max-w-[150px] truncate" title={user}>
              {user}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
