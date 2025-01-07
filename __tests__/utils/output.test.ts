import { jest } from '@jest/globals'
import { ResetCoreMetadata } from '../../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../../src/stubs/env.js'
import { printTitle } from '../../src/utils/output.js'

// Prevent output during tests
const console_logSpy: jest.SpiedFunction<typeof console.log> = jest
  .spyOn(console, 'log')
  .mockImplementation(() => {})

describe('Output', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('printTitle()', () => {
    it('Prints the correct number of (=) signs', () => {
      printTitle(console.log, 'Test')

      expect(console_logSpy).toHaveBeenCalledTimes(3)
      expect(console_logSpy).toHaveBeenNthCalledWith(1, '='.repeat(80))
      expect(console_logSpy).toHaveBeenNthCalledWith(2, `${' '.repeat(38)}Test`)
      expect(console_logSpy).toHaveBeenNthCalledWith(3, '='.repeat(80))
    })
  })
})
