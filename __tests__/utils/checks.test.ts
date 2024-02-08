import * as coreStubs from '../../src/stubs/core-stubs'
import * as envStubs from '../../src/stubs/env-stubs'
import * as checks from '../../src/utils/checks'

describe('Checks', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
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

  describe('checkActionPath()', () => {
    it('Throws if the path is not a directory', () => {
      expect(() => checks.checkActionPath('package.json')).toThrow()
    })

    it('Throws if the path does not exist', () => {
      expect(() => checks.checkActionPath('test/path/does/not/exist')).toThrow()
    })

    it('Throws if the path does not contain an action.yml file', () => {
      expect(() => checks.checkActionPath('./__fixtures__')).toThrow()
    })
  })

  describe('checkEntryPoint()', () => {
    it('Throws if the entrypoint does not exist', () => {
      expect(() => checks.checkEntryPoint('index.js')).toThrow()
    })
  })

  describe('checkEnvFile()', () => {
    it('Throws if the env file does not exist', () => {
      expect(() => checks.checkEnvFile('test.env')).toThrow()
    })
  })
})
