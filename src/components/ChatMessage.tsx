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
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]" />
          </div>
        )}
      </div>
    </div>
  )
}
