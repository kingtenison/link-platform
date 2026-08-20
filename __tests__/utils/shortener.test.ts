import { generateShortCode, validateUrl, ensureProtocol } from '@/utils/shortener'

jest.mock('nanoid')

describe('generateShortCode', () => {
  it('generates a 6-character code', () => {
    const code = generateShortCode()
    expect(code).toHaveLength(6)
  })

  it('generates alphanumeric codes', () => {
    const code = generateShortCode()
    expect(code).toMatch(/^[0-9A-Za-z]+$/)
  })

  it('generates unique codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateShortCode())
    }
    expect(codes.size).toBe(100)
  })
})

describe('validateUrl', () => {
  it('accepts https URLs', () => {
    expect(validateUrl('https://example.com/path?q=1')).toBe(true)
  })

  it('accepts http URLs', () => {
    expect(validateUrl('http://example.com')).toBe(true)
  })

  it('accepts URLs without protocol', () => {
    expect(validateUrl('example.com/path')).toBe(true)
  })

  it('rejects javascript: URLs', () => {
    expect(validateUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: URLs', () => {
    expect(validateUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('rejects file:, vbscript: and other schemes', () => {
    expect(validateUrl('file:///etc/passwd')).toBe(false)
    expect(validateUrl('vbscript:msgbox(1)')).toBe(false)
    expect(validateUrl('ftp://example.com')).toBe(false)
  })

  it('rejects empty and overlong input', () => {
    expect(validateUrl('')).toBe(false)
    expect(validateUrl('a'.repeat(2049))).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(validateUrl('not a url at all with spaces and junk')).toBe(false)
    expect(validateUrl('https://')).toBe(false)
  })
})

describe('ensureProtocol', () => {
  it('adds https:// when no protocol present', () => {
    expect(ensureProtocol('example.com')).toBe('https://example.com')
  })

  it('keeps https/http protocols', () => {
    expect(ensureProtocol('https://example.com')).toBe('https://example.com')
    expect(ensureProtocol('http://example.com')).toBe('http://example.com')
  })

  it('downgrades dangerous schemes to https with host preserved', () => {
    expect(ensureProtocol('javascript:alert(1)')).toBe('https://alert(1)')
    expect(ensureProtocol('ftp://example.com/file')).toBe('https://example.com/file')
  })

  it('returns empty string for empty input', () => {
    expect(ensureProtocol('')).toBe('')
  })
})