import { customAlphabet } from 'nanoid'

// Generate short code (6 characters from 62 possible)
export const generateShortCode = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  6
)

const VALID_PROTOCOLS = ['http:', 'https:']

// Validate URL: must be absolute and use an allowed protocol (http/https).
// Rejects javascript:, data:, vbscript:, file: and other dangerous schemes.
export function validateUrl(url: string): boolean {
  if (!url || url.length > 2048) return false
  try {
    const parsed = new URL(url)
    return VALID_PROTOCOLS.includes(parsed.protocol)
  } catch {
    // Try with https:// prefix (e.g. "example.com/path")
    try {
      const prefixed = new URL('https://' + url)
      return prefixed.hostname.includes('.')
    } catch {
      return false
    }
  }
}

// Add https if no protocol, but preserve existing protocols
export function ensureProtocol(url: string): string {
  if (!url) return ''

  // Check if it already has a protocol (anything: or anything://)
  const schemeMatch = url.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?/)
  if (schemeMatch) {
    const scheme = schemeMatch[1] + ':'
    if (VALID_PROTOCOLS.includes(scheme)) {
      return url
    }
    const rest = url.slice(schemeMatch[0].length)
    return rest ? `https://${rest}` : ''
  }

  // Add https:// if no protocol
  return 'https://' + url
}