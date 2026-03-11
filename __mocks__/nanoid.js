// Mock for nanoid
const mockGenerate = jest.fn().mockImplementation(() => {
  // Return a consistent 6-character string for testing
  return 'abc123'
})

const customAlphabet = jest.fn().mockImplementation(() => mockGenerate)
const nanoid = mockGenerate

module.exports = { 
  nanoid,
  customAlphabet,
  __esModule: true,
  default: nanoid
}
