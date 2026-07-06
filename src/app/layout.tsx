import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PaperBrain',
  description: 'AI-powered document Q&A — upload your documents and chat with them using intelligent retrieval.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased text-[#111827] bg-[#f9fafb] min-h-screen">
        {children}
      </body>
    </html>
  )
}
