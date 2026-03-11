import { customAlphabet } from 'nanoid'

// Generate short code (6 characters from 62 possible)
export const generateShortCode = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  6
)

// Validate URL
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url)
    return hostname.replace('www.', '')
  } catch {
    return ''
  }
}

// Add https if no protocol, but preserve existing protocols
export function ensureProtocol(url: string): string {
  if (!url) return 'https://'
  
  // Check if it already has a protocol (anything://)
  if (/^[a-zA-Z]+:\/\//.test(url)) {
    return url // Keep original protocol (http, https, ftp, etc.)
  }
  
  // Add https:// if no protocol
  return 'https://' + url
}
