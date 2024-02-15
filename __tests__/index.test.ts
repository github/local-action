/* eslint-disable import/no-namespace */

import { Command } from 'commander'
import * as command from '../src/command'
import { run } from '../src/index'
import { ResetCoreMetadata } from '../src/stubs/core-stubs'
import { ResetEnvMetadata } from '../src/stubs/env-stubs'

let command_makeProgramSpy: jest.SpyInstance

describe('Index', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()

    // Stub the command.makeProgram call
    command_makeProgramSpy = jest
      .spyOn(command, 'makeProgram')
      .mockImplementation(async () => {
        return Promise.resolve({
          parse: () => {}
        } as Command)
      })
  })

  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('run()', () => {
    it('Runs the program', async () => {
      await run()

      expect(command_makeProgramSpy).toHaveBeenCalled()
    })
  })
})
