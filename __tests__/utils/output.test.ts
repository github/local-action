import * as coreStubs from '../../src/stubs/core-stubs'
import * as envStubs from '../../src/stubs/env-stubs'
import * as output from '../../src/utils/output'

let console_logSpy: jest.SpyInstance

describe('Output', () => {
  beforeAll(() => {
    // Prevent output during tests
    console_logSpy = jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
  })

  beforeEach(() => {
    // Reset metadata
    envStubs.ResetEnvMetadata()
    coreStubs.ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('printTitle()', () => {
    it('Prints the correct number of (=) signs', () => {
      output.printTitle(console.log, 'Test')

      expect(console_logSpy).toHaveBeenCalledTimes(3)
      expect(console_logSpy).toHaveBeenNthCalledWith(1, '='.repeat(80))
      expect(console_logSpy).toHaveBeenNthCalledWith(2, `${' '.repeat(38)}Test`)
      expect(console_logSpy).toHaveBeenNthCalledWith(3, '='.repeat(80))
    })
  })
})
