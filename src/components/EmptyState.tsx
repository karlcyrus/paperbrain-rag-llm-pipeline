'use client'

interface EmptyStateProps {
  title: string
  description: string
  icon: string
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-[#111827] dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">{description}</p>
    </div>
  )
}
