import { generateShortCode } from '@/utils/shortener'

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
