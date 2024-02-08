import { Command } from 'commander'
import * as command from '../src/command'
import * as coreStubs from '../src/stubs/core-stubs'
import * as envStubs from '../src/stubs/env-stubs'

let command_makeProgramSpy: jest.SpyInstance

describe('Index', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()

    // Stub the command.makeProgram call
    command_makeProgramSpy = jest
      .spyOn(command, 'makeProgram')
      .mockImplementation(() => {
        return {
          parse: () => {}
        } as Command
      })
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

  describe('run()', () => {
    it('Runs the program', async () => {
      const index: typeof import('../src/index') = (await import(
        '../src/index'
      )) as typeof import('../src/index')

      await index.run()

      expect(command_makeProgramSpy).toHaveBeenCalled()
    })
  })
})
