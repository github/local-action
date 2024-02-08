import { Command } from 'commander'
import * as command from '../src/command'
import * as run from '../src/commands/run'
import * as coreStubs from '../src/stubs/core-stubs'
import * as envStubs from '../src/stubs/env-stubs'

let process_exitSpy: jest.SpyInstance
let program: Command
let run_actionSpy: jest.SpyInstance

describe('Commmand', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
  })

  beforeEach(() => {
    // Reset metadata
    envStubs.ResetEnvMetadata()
    coreStubs.ResetCoreMetadata()

    // Create a new program before each test
    program = command.makeProgram()

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
      await command
        .makeProgram()
        .parseAsync(
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
      const process_stderrSpy: jest.SpyInstance = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await command.makeProgram().parseAsync([], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if no entrypoint argument is provided', async () => {
      const process_stderrSpy: jest.SpyInstance = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await command
        .makeProgram()
        .parseAsync(['./__fixtures__/typescript/success', ''], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if no env-file argument is provided', async () => {
      const process_stderrSpy: jest.SpyInstance = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation()

      await command
        .makeProgram()
        .parseAsync(['./__fixtures__/typescript/success', 'src/index.ts'], {
          from: 'user'
        })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })
  })
})
