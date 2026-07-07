import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { parseFile, getFileType } from '@/lib/parser'
import { chunkText } from '@/lib/chunker'
import { generateEmbedding } from '@/lib/gemini'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // 4. Validate file type
    const fileType = getFileType(file.name)
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: pdf, docx, txt' },
        { status: 400 }
      )
    }

    // 5. Parse the file content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text: string
    try {
      text = await parseFile(buffer, fileType)
    } catch (parseError) {
      console.error('File parsing error:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse file content' },
        { status: 422 }
      )
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the file' },
        { status: 422 }
      )
    }

    // 6. Chunk the text
    const chunks = chunkText(text)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No text chunks could be generated' },
        { status: 422 }
      )
    }

    // 7. Create the document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: file.name,
        file_type: fileType,
      })
      .select('id')
      .single()

    if (docError || !document) {
      console.error('Document insert error:', docError)
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // 8. Generate embeddings and store chunks (with rate limiting)
    const chunkRecords = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      // Add delay between calls to stay under free tier limit (100 req/min)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 700))
      }
      console.log(`Embedding chunk ${i + 1}/${chunks.length}...`)
      const embedding = await generateEmbedding(chunk.content)
      chunkRecords.push({
        document_id: document.id,
        content: chunk.content,
        embedding: JSON.stringify(embedding),
        chunk_index: chunk.index,
      })
    }

    // Insert chunks in batches of 20 to avoid payload limits
    const BATCH_SIZE = 20
    for (let i = 0; i < chunkRecords.length; i += BATCH_SIZE) {
      const batch = chunkRecords.slice(i, i + BATCH_SIZE)
      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert(batch)

      if (chunkError) {
        console.error('Chunk insert error:', chunkError)
        // Clean up the document record on failure
        await supabase.from('documents').delete().eq('id', document.id)
        return NextResponse.json(
          { error: 'Failed to store document chunks' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        documentId: document.id,
        name: file.name,
        chunksCount: chunks.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
