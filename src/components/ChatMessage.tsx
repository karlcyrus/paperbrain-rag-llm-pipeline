'use client'

import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="chat-bubble-user">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="chat-bubble-assistant">
        {content ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <div className="flex items-center gap-1.5 py-1 px-1">
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
            <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
          </div>
        )}
      </div>
    </div>
  )
}
