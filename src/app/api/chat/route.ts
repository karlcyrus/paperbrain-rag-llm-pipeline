import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateEmbedding, generateChatResponse } from '@/lib/gemini'

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
        JSON.stringify({ error: 'Failed to search documents' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 5. Build the RAG prompt with numbered excerpts
    const excerpts = (matchedChunks || [])
      .map(
        (chunk: { content: string }, i: number) =>
          `[Excerpt ${i + 1}]:\n${chunk.content}`
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

    // 7. Stream the Gemini response
    const stream = await generateChatResponse(prompt)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Sources': Buffer.from(JSON.stringify(sources)).toString('base64'),
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
