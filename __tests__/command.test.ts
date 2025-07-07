import { jest } from '@jest/globals'
import { Command } from 'commander'
import path from 'path'
import { ResetCoreMetadata } from '../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../src/stubs/env.js'

const action = jest.fn()

jest.unstable_mockModule('../src/commands/run.js', () => {
  return {
    action
  }
})

const process_exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error(`process.exit()`)
})

const { makeProgram } = await import('../src/command.js')

describe('Commmand', () => {
  beforeEach(async () => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('makeProgram()', () => {
    it('Returns a Program', async () => {
      const program = await makeProgram()

      expect(program).not.toBe(null)
      expect(program).toBeInstanceOf(Command)
    })

    it('Has a run command', async () => {
      const program = await makeProgram()

      expect(program.commands.find(c => c.name() === 'run')).toBeInstanceOf(
        Command
      )
    })

    it('Runs if all arguments are provided (action.yml)', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      program.parse(
        [
          './__fixtures__/typescript/success',
          'src/main.ts',
          './__fixtures__/typescript/success/.env.fixture',
          '--pre',
          'pre/main.ts',
          '--post',
          'post/main.ts'
        ],
        {
          from: 'user'
        }
      )

      expect(action).toHaveBeenCalled()
    })

    it('Runs if all arguments are provided (action.yaml)', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve(
        './__fixtures__/typescript/success-yaml'
      )

      program.parse(
        [
          './__fixtures__/typescript/success-yaml',
          'src/main.ts',
          './__fixtures__/typescript/success-yaml/.env.fixture',
          '--pre',
          'pre/main.ts',
          '--post',
          'post/main.ts'
        ],
        {
          from: 'user'
        }
      )

      expect(action).toHaveBeenCalled()
    })

    it('Exits if no path argument is provided', async () => {
      const program = await makeProgram()

      program.parse([], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()
    })

    it('Exits if no entrypoint argument is provided', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      program.parse(['./__fixtures__/typescript/success', ''], { from: 'user' })

      expect(process_exitSpy).toHaveBeenCalled()
    })

    it('Exits if no env-file argument is provided', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      program.parse(['./__fixtures__/typescript/success', 'src/main.ts'], {
        from: 'user'
      })

      expect(process_exitSpy).toHaveBeenCalled()
    })

    it('Exits if the action path is not a directory', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      expect(() => {
        program.parse(['./package.json', 'src/main.ts', '.env'], {
          from: 'user'
        })
      }).toThrow('Action path must be a directory')
    })

    it('Exits if the action path does not exist', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('/test/path/does/not/exist')

      expect(() => {
        program.parse(['/test/path/does/not/exist', 'src/main.ts', '.env'], {
          from: 'user'
        })
      }).toThrow('Action path does not exist')
    })

    it('Exits if the action path does not contain an action.yml or action.yaml', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__')

      expect(() => {
        program.parse(['./__fixtures__', 'src/main.ts', '.env'], {
          from: 'user'
        })
      }).toThrow('Path must contain an action.yml / action.yaml file')
    })

    it('Exits if the entrypoint does not exist', async () => {
      const program = await makeProgram()

      expect(() => {
        program.parse(
          ['./__fixtures__/typescript/success', 'src/fake.ts', '.env'],
          {
            from: 'user'
          }
        )
      }).toThrow('Entrypoint does not exist')
    })

    it('Exits if the pre entrypoint does not exist', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      expect(() => {
        program.parse(
          [
            './__fixtures__/typescript/success',
            'src/main.ts',
            './__fixtures__/typescript/success/.env.fixture',
            '--pre',
            'pre/fake.ts'
          ],
          {
            from: 'user'
          }
        )
      }).toThrow('PRE entrypoint does not exist')
    })

    it('Exits if the post entrypoint does not exist', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      expect(() => {
        program.parse(
          [
            './__fixtures__/typescript/success',
            'src/main.ts',
            './__fixtures__/typescript/success/.env.fixture',
            '--pre',
            'pre/main.ts',
            '--post',
            'post/fake.ts'
          ],
          {
            from: 'user'
          }
        )
      }).toThrow('POST entrypoint does not exist')
    })

    it('Throws if the dotenv file does not exist', async () => {
      const program = await makeProgram()
      EnvMeta.actionPath = path.resolve('./__fixtures__/typescript/success')

      expect(() => {
        program.parse(
          ['./__fixtures__/typescript/success', 'src/main.ts', '.notreal.env'],
          {
            from: 'user'
          }
        )
      }).toThrow('Environment file does not exist')
    })
  })
})
