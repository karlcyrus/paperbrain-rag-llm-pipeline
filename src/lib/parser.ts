/**
 * Parse document files (PDF, DOCX, TXT) and extract plain text content.
 */

export type SupportedFileType = 'pdf' | 'docx' | 'txt'

/**
 * Parse a file buffer and return extracted text.
 * @param buffer - The raw file data
 * @param fileType - One of 'pdf', 'docx', or 'txt'
 * @returns The extracted plain text
 */
export async function parseFile(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return parsePDF(buffer)
    case 'docx':
      return parseDOCX(buffer)
    case 'txt':
      return parseTXT(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  const { extractText } = await import('unpdf')
  const uint8Array = new Uint8Array(buffer)
  const { text } = await extractText(uint8Array)
  return Array.isArray(text) ? text.join('\n') : text
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

function parseTXT(buffer: Buffer): string {
  return buffer.toString('utf-8')
}

/**
 * Extract file extension and validate it as a supported type.
 * @returns The validated file type or null if unsupported
 */
export function getFileType(fileName: string): SupportedFileType | null {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf' || ext === 'docx' || ext === 'txt') {
    return ext
  }
  return null
}
