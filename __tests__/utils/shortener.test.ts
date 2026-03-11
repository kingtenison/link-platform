import { generateShortCode, validateUrl, ensureProtocol } from '@/utils/shortener'

describe('URL Shortener Utils', () => {
  test('generateShortCode returns a string', () => {
    const code = generateShortCode()
    expect(typeof code).toBe('string')
    expect(code.length).toBeGreaterThan(0)
  })

  test('validateUrl returns true for valid URLs', () => {
    expect(validateUrl('https://google.com')).toBe(true)
    expect(validateUrl('http://example.com')).toBe(true)
    expect(validateUrl('https://sub.domain.com/path?query=1')).toBe(true)
  })

  test('validateUrl returns false for invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false)
    expect(validateUrl('http://')).toBe(false)
    expect(validateUrl('')).toBe(false)
  })

  test('ensureProtocol adds https:// when missing', () => {
    expect(ensureProtocol('google.com')).toBe('https://google.com')
    expect(ensureProtocol('http://google.com')).toBe('http://google.com')
    expect(ensureProtocol('https://google.com')).toBe('https://google.com')
  })

  test('ensureProtocol handles edge cases', () => {
    expect(ensureProtocol('')).toBe('https://')
    expect(ensureProtocol('ftp://example.com')).toBe('ftp://example.com')
  })
})
