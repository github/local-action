import { jest } from '@jest/globals'
import { ResetCoreMetadata } from '../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../src/stubs/env.js'

const makeProgram = jest.fn().mockResolvedValue({
  parse: jest.fn()
} as never)

jest.unstable_mockModule('../src/command.js', () => {
  return {
    makeProgram
  }
})

// Prevent output during tests
jest.spyOn(console, 'log').mockImplementation(() => {})

const { run } = await import('../src/index.js')

describe('Index', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('run()', () => {
    it('Runs the program', async () => {
      await run()
      expect(makeProgram).toHaveBeenCalled()
    })
  })
})
