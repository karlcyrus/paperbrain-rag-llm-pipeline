export interface TextChunk {
  content: string
  index: number
}

const CHUNK_SIZE = 2000   // ~500 tokens
const CHUNK_OVERLAP = 200 // overlap in characters

/**
 * Split text into overlapping chunks of approximately CHUNK_SIZE characters.
 * Tries to break at sentence boundaries to preserve readability.
 */
export function chunkText(text: string): TextChunk[] {
  // Normalize whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim()

  if (cleaned.length === 0) {
    return []
  }

  // If the text fits in one chunk, return it directly
  if (cleaned.length <= CHUNK_SIZE) {
    return [{ content: cleaned, index: 0 }]
  }

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE

    // If we haven't reached the end of the text, try to break at a sentence boundary
    if (end < cleaned.length) {
      // Look for the last sentence-ending punctuation within the chunk
      const segment = cleaned.slice(start, end)
      const lastSentenceEnd = Math.max(
        segment.lastIndexOf('. '),
        segment.lastIndexOf('? '),
        segment.lastIndexOf('! '),
        segment.lastIndexOf('.\n'),
        segment.lastIndexOf('\n\n')
      )

      // Only use sentence boundary if it's in the latter half of the chunk
      // to avoid very small chunks
      if (lastSentenceEnd > CHUNK_SIZE / 2) {
        end = start + lastSentenceEnd + 1 // +1 to include the punctuation
      }
    } else {
      end = cleaned.length
    }

    const chunkContent = cleaned.slice(start, end).trim()
    if (chunkContent.length > 0) {
      chunks.push({ content: chunkContent, index })
      index++
    }

    // Move start forward, accounting for overlap
    start = end - CHUNK_OVERLAP
    if (start <= chunks[chunks.length - 1]?.index && start + CHUNK_OVERLAP >= cleaned.length) {
      break // Prevent infinite loop at end of text
    }
  }

  return chunks
}
