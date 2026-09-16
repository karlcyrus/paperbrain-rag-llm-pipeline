'use client'

interface EmptyStateProps {
  title: string
  description: string
  icon: string
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 animate-fade-in border-2 border-dashed border-gray-200 dark:border-zinc-800/50 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/10 transition-colors duration-300">
      <span className="text-5xl mb-6 drop-shadow-md">{icon}</span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-200 mb-2 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-500 font-light text-center max-w-sm transition-colors duration-300">{description}</p>
    </div>
  )
}
