import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateEmbedding, generateChatResponse } from '@/lib/gemini'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Parse request body
    const body = await request.json()
    const { question, documentIds } = body as {
      question: string
      documentIds: string[]
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one document ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. Generate embedding for the question
    console.log('Generating embedding for question...')
    const queryEmbedding = await generateEmbedding(question.trim())
    console.log('Embedding generated, searching chunks...')

    // 4. Search for matching chunks via Supabase RPC
    const { data: matchedChunks, error: matchError } = await supabase.rpc(
      'match_document_chunks',
      {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_count: 8,
        filter_document_ids: documentIds,
      }
    )

    if (matchError) {
      console.error('Vector search error:', matchError)
      return new Response(
        JSON.stringify({ error: 'Failed to search documents. The vector search encountered an error.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 5. Build the RAG prompt with numbered excerpts
    const excerpts = (matchedChunks || [])
      .map(
        (chunk: { content: string; document_id: string }, i: number) =>
          `[Excerpt ${i + 1} (Document: ${chunk.document_id})]:\n${chunk.content}`
      )
      .join('\n\n')

    const prompt = `You are a helpful AI assistant. Answer the user's question based ONLY on the provided document excerpts. If the answer cannot be found in the excerpts, say so clearly. Always cite which excerpt number you used.

Document Excerpts:
${excerpts}

User Question: ${question.trim()}`

    // 6. Prepare source metadata for the response header
    const sources = (matchedChunks || []).map(
      (chunk: {
        content: string
        document_id: string
        chunk_index: number
        similarity: number
      }) => ({
        content: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
        documentId: chunk.document_id,
        chunkIndex: chunk.chunk_index,
        similarity: chunk.similarity,
      })
    )

    // 7. Stream the Gemini response with retry logic for 429/503
    let stream: ReadableStream
    let lastError: Error | null = null

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        stream = await generateChatResponse(prompt)
        lastError = null
        break
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const errMessage = lastError.message

        // Check if it's a retryable error (429 or 503)
        const is429 = errMessage.includes('429')
        const is503 = errMessage.includes('503')

        if ((is429 || is503) && attempt === 0) {
          const waitMs = is429 ? 3000 : 2000
          console.log(`Gemini returned ${is429 ? '429' : '503'}, retrying in ${waitMs}ms...`)
          await sleep(waitMs)
          continue
        }

        // Non-retryable or second attempt failed
        if (is429) {
          return new Response(
            JSON.stringify({ error: 'The AI model is currently rate limited. Please wait a moment and try again.' }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        if (is503) {
          return new Response(
            JSON.stringify({ error: 'The AI service is temporarily unavailable. Please try again in a few seconds.' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        throw lastError
      }
    }

    if (lastError) {
      throw lastError
    }

    return new Response(stream!, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Sources': Buffer.from(JSON.stringify(sources)).toString('base64'),
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(JSON.stringify({ error: `Chat failed: ${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
