/**
 * Gemini API utilities for embeddings and chat.
 * Uses REST API directly for reliable API version control.
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1'

/**
 * Generate a 768-dimensional embedding vector for the given text
 * using Gemini's gemini-embedding-001 model.
 * Includes retry logic for rate limiting.
 */
export async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        }),
      }
    )

    if (response.ok) {
      const data = await response.json()
      return data.embedding.values
    }

    // Handle rate limiting with retry
    if (response.status === 429 && attempt < retries) {
      const waitTime = Math.pow(2, attempt) * 5000 // 5s, 10s, 20s
      console.log(`Rate limited, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${retries}...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      continue
    }

    const error = await response.text()
    console.error('Embedding API error:', error)
    throw new Error(`Embedding API error: ${response.status} ${response.statusText}`)
  }

  throw new Error('Failed to generate embedding after retries')
}

/**
 * Generate a streaming chat response from Gemini 2.0 Flash.
 * Returns a ReadableStream of UTF-8 encoded text chunks.
 */
export async function generateChatResponse(prompt: string): Promise<ReadableStream> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const response = await fetch(
    `${GEMINI_API_BASE}/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Chat API error: ${response.status} - ${error}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          // Parse SSE events
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim()
              if (jsonStr === '[DONE]') continue
              try {
                const parsed = JSON.parse(jsonStr)
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(encoder.encode(text))
                }
              } catch {
                // Skip non-JSON lines
              }
            }
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
