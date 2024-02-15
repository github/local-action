/* eslint-disable import/no-namespace */

import { Command } from 'commander'
import { makeProgram } from '../src/command'
import * as run from '../src/commands/run'
import { ResetCoreMetadata } from '../src/stubs/core-stubs'
import { ResetEnvMetadata } from '../src/stubs/env-stubs'

let process_exitSpy: jest.SpyInstance
let process_stderrSpy: jest.SpyInstance
let program: Command
let run_actionSpy: jest.SpyInstance

describe('Commmand', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
  })

  beforeEach(async () => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Create a new program before each test
    program = await makeProgram()

    // Stub the run action and process.exit
    run_actionSpy = jest.spyOn(run, 'action').mockImplementation()
    process_exitSpy = jest.spyOn(process, 'exit').mockImplementation()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('makeProgram()', () => {
    it('Returns a Program', () => {
      expect(program).not.toBe(null)
      expect(program).toBeInstanceOf(Command)
    })

    it('Has a run command', () => {
      expect(program.commands.find(c => c.name() === 'run')).toBeInstanceOf(
        Command
      )
    })

    it('Runs if all arguments are provided', async () => {
      await (
        await makeProgram()
      ).parseAsync(
        [
          './__fixtures__/typescript/success',
          'src/index.ts',
          './__fixtures__/typescript/success/.env.fixture'
        ],
        {
          from: 'user'
        }
      )

      expect(process_exitSpy).not.toHaveBeenCalled()
      expect(run_actionSpy).toHaveBeenCalled()
    })

    it('Exits if no path argument is provided', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await (await makeProgram()).parseAsync([], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if no entrypoint argument is provided', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await (
        await makeProgram()
      ).parseAsync(['./__fixtures__/typescript/success', ''], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if no env-file argument is provided', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await (
        await makeProgram()
      ).parseAsync(['./__fixtures__/typescript/success', 'src/index.ts'], {
        from: 'user'
      })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if the action path is not a directory', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await expect(
        (await makeProgram()).parseAsync(
          ['./package.json', 'src/index.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Action path must be a directory')

      process_stderrSpy.mockRestore()
    })

    it('Exits if the action path does not exist', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await expect(
        (await makeProgram()).parseAsync(
          ['/test/path/does/not/exist', 'src/index.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Action path does not exist')

      process_stderrSpy.mockRestore()
    })

    it('Exits if the action path does not contain an action.yml', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await expect(
        (await makeProgram()).parseAsync(
          ['./__fixtures__', 'src/index.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Path must contain an action.yml file')

      process_stderrSpy.mockRestore()
    })

    it('Exits if the entrypoint does not exist', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await expect(
        (await makeProgram()).parseAsync(
          ['./__fixtures__/typescript/success', 'src/fake.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Entrypoint does not exist')

      process_stderrSpy.mockRestore()
    })

    it('Throws if the env file does not exist', async () => {
      process_stderrSpy = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await expect(
        (await makeProgram()).parseAsync(
          ['./__fixtures__/typescript/success', 'src/index.ts', '.notreal.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Environment file does not exist')

      process_stderrSpy.mockRestore()
    })
  })
})
