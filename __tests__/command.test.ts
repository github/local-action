import { jest } from '@jest/globals'
import { Command } from 'commander'
import { ResetCoreMetadata } from '../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../src/stubs/env.js'

const action = jest.fn()

jest.unstable_mockModule('../src/commands/run.js', () => {
  return {
    action
  }
})

const process_exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error(`process.exit()`)
})

const process_stderrSpy = jest
  .spyOn(process.stderr, 'write')
  .mockImplementation(() => true)

let program: Command

// Prevent output during tests
jest.spyOn(console, 'log').mockImplementation(() => {})

const { makeProgram } = await import('../src/command.js')

describe('Commmand', () => {
  beforeEach(async () => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Create a new program before each test
    program = await makeProgram()
  })

  afterEach(() => {
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

    it('Runs if all arguments are provided (action.yml)', async () => {
      await (
        await makeProgram()
      ).parseAsync(
        [
          './__fixtures__/typescript/success',
          'src/main.ts',
          './__fixtures__/typescript/success/.env.fixture'
        ],
        {
          from: 'user'
        }
      )

      expect(process_exitSpy).not.toHaveBeenCalled()
      expect(action).toHaveBeenCalled()
    })

    it('Runs if all arguments are provided (action.yaml)', async () => {
      await (
        await makeProgram()
      ).parseAsync(
        [
          './__fixtures__/typescript/success-yaml',
          'src/main.ts',
          './__fixtures__/typescript/success-yaml/.env.fixture'
        ],
        {
          from: 'user'
        }
      )

      expect(process_exitSpy).not.toHaveBeenCalled()
      expect(action).toHaveBeenCalled()
    })

    it('Exits if no path argument is provided', async () => {
      await (await makeProgram()).parseAsync([], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if no entrypoint argument is provided', async () => {
      await (
        await makeProgram()
      ).parseAsync(['./__fixtures__/typescript/success', ''], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if no env-file argument is provided', async () => {
      await (
        await makeProgram()
      ).parseAsync(['./__fixtures__/typescript/success', 'src/main.ts'], {
        from: 'user'
      })

      expect(process_exitSpy).toHaveBeenCalled()

      process_stderrSpy.mockRestore()
    })

    it('Exits if the action path is not a directory', async () => {
      await expect(
        (await makeProgram()).parseAsync(
          ['./package.json', 'src/main.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Action path must be a directory')

      process_stderrSpy.mockRestore()
    })

    it('Exits if the action path does not exist', async () => {
      await expect(
        (await makeProgram()).parseAsync(
          ['/test/path/does/not/exist', 'src/main.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Action path does not exist')

      process_stderrSpy.mockRestore()
    })

    it('Exits if the action path does not contain an action.yml or action.yaml', async () => {
      await expect(
        (await makeProgram()).parseAsync(
          ['./__fixtures__', 'src/main.ts', '.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Path must contain an action.yml / action.yaml file')

      process_stderrSpy.mockRestore()
    })

    it('Exits if the entrypoint does not exist', async () => {
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

    it('Throws if the dotenv file does not exist', async () => {
      await expect(
        (await makeProgram()).parseAsync(
          ['./__fixtures__/typescript/success', 'src/main.ts', '.notreal.env'],
          {
            from: 'user'
          }
        )
      ).rejects.toThrow('Environment file does not exist')

      process_stderrSpy.mockRestore()
    })
  })
})
