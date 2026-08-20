// Mock for nanoid (ESM-only in v5, Jest uses this via jest.mock('nanoid'))
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const generate = (size = 21) => {
  const bytes = []
  for (let i = 0; i < size; i++) {
    bytes.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)])
  }
  return bytes.join('')
}

const customAlphabet = jest.fn((alphabet, size) => () => generate(size))
const nanoid = jest.fn(() => generate())

module.exports = {
  nanoid,
  customAlphabet,
  __esModule: true,
  default: nanoid,
}