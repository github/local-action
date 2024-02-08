import { ExitCode } from '../../src/enums'
import * as coreStubs from '../../src/stubs/core-stubs'
import * as envStubs from '../../src/stubs/env-stubs'
import type { CoreMetadata } from '../../src/types'

// eslint-disable-next-line no-undef
let envBackup: NodeJS.ProcessEnv = process.env

/** Empty CoreMetadata Object */
const empty: CoreMetadata = {
  exitCode: ExitCode.Success,
  exitMessage: '',
  outputs: {},
  secrets: [],
  stepDebug: process.env.ACTIONS_STEP_DEBUG === 'true',
  echo: false,
  state: {},
  colors: {
    cyan: console.log,
    blue: console.log,
    gray: console.log,
    green: console.log,
    magenta: console.log,
    red: console.log,
    white: console.log,
    yellow: console.log
  }
}

describe('Core', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
  })

  beforeEach(() => {
    // Reset metadata
    envStubs.ResetEnvMetadata()
    coreStubs.ResetCoreMetadata()

    // Back up environment variables
    envBackup = process.env
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()

    // Restore environment variables
    process.env = envBackup
  })

  describe('CoreMeta', () => {
    it('Tracks updates to the core metadata', () => {
      // Initial state should be empty
      expect(coreStubs.CoreMeta.exitCode).toEqual(empty.exitCode)
      expect(coreStubs.CoreMeta.exitMessage).toEqual(empty.exitMessage)
      expect(coreStubs.CoreMeta.outputs).toMatchObject(empty.outputs)
      expect(coreStubs.CoreMeta.secrets).toMatchObject(empty.secrets)
      expect(coreStubs.CoreMeta.stepDebug).toEqual(empty.stepDebug)
      expect(coreStubs.CoreMeta.echo).toEqual(empty.echo)
      expect(coreStubs.CoreMeta.state).toMatchObject(empty.state)

      // Update the metadata
      coreStubs.CoreMeta.exitCode = ExitCode.Failure
      coreStubs.CoreMeta.exitMessage = 'test'
      coreStubs.CoreMeta.outputs = { 'my-output': 'test' }
      coreStubs.CoreMeta.secrets = ['secret-value-1234']
      coreStubs.CoreMeta.stepDebug = true
      coreStubs.CoreMeta.echo = true
      coreStubs.CoreMeta.state = { 'my-state': 'test' }

      // Verify the updated metadata
      expect(coreStubs.CoreMeta.exitCode).toEqual(ExitCode.Failure)
      expect(coreStubs.CoreMeta.exitMessage).toEqual('test')
      expect(coreStubs.CoreMeta.outputs).toMatchObject({ 'my-output': 'test' })
      expect(coreStubs.CoreMeta.secrets).toMatchObject(['secret-value-1234'])
      expect(coreStubs.CoreMeta.stepDebug).toEqual(true)
      expect(coreStubs.CoreMeta.echo).toEqual(true)
      expect(coreStubs.CoreMeta.state).toMatchObject({ 'my-state': 'test' })

      // Reset the metadata
      coreStubs.ResetCoreMetadata()

      // Verify the reset metadata
      expect(coreStubs.CoreMeta.exitCode).toEqual(empty.exitCode)
      expect(coreStubs.CoreMeta.exitMessage).toEqual(empty.exitMessage)
      expect(coreStubs.CoreMeta.outputs).toMatchObject(empty.outputs)
      expect(coreStubs.CoreMeta.secrets).toMatchObject(empty.secrets)
      expect(coreStubs.CoreMeta.stepDebug).toEqual(empty.stepDebug)
      expect(coreStubs.CoreMeta.echo).toEqual(empty.echo)
      expect(coreStubs.CoreMeta.state).toMatchObject(empty.state)
    })
  })

  describe('Core Stubs', () => {
    describe('exportVariable()', () => {
      it('Exports an environment variable', () => {
        coreStubs.exportVariable('TEST', 'test')
        expect(envStubs.EnvMeta.env).toMatchObject({ TEST: 'test' })
      })
    })

    describe('setSecre()', () => {
      it('Sets a secret to mask', () => {
        coreStubs.setSecret('test')
        expect(coreStubs.CoreMeta.secrets).toMatchObject(['test'])
      })
    })

    describe('addPath()', () => {
      it('Appends to the path', () => {
        coreStubs.addPath('/usr/test')
        expect(envStubs.EnvMeta.path.includes('/usr/test')).toBeTruthy()
      })
    })

    describe('getInput()', () => {
      it('Gets action inputs', () => {
        // Test both upper and lower case versions of the input
        process.env.INPUT_TEST = 'test-upper'
        expect(coreStubs.getInput('test')).toEqual('test-upper')

        delete process.env.INPUT_TEST

        process.env.INPUT_test = 'test-lower'
        expect(coreStubs.getInput('test')).toEqual('test-lower')
      })

      it('Returns an empty string', () => {
        expect(coreStubs.getInput('test-input-missing')).toEqual('')
      })

      it('Throws an error if the input is required and not found', () => {
        expect(() =>
          coreStubs.getInput('test-input-missing', { required: true })
        ).toThrow()
      })

      it('Trims whitespace', () => {
        process.env.INPUT_TEST = '  test  '
        expect(coreStubs.getInput('test', { trimWhitespace: true })).toEqual(
          'test'
        )
      })
    })

    describe('getMultilineInput()', () => {
      it('Gets action inputs', () => {
        // Test both upper and lower case versions of the input
        process.env.INPUT_TEST = `test\nmultiline\nupper`
        expect(coreStubs.getMultilineInput('test')).toMatchObject([
          'test',
          'multiline',
          'upper'
        ])

        delete process.env.INPUT_TEST

        process.env.INPUT_test = `test\nmultiline\nlower`
        expect(coreStubs.getMultilineInput('test')).toMatchObject([
          'test',
          'multiline',
          'lower'
        ])
      })

      it('Returns an empty list if the input is not found', () => {
        expect(coreStubs.getMultilineInput('test-input-missing')).toMatchObject(
          []
        )
      })

      it('Throws an error if the input is required and not found', () => {
        expect(() =>
          coreStubs.getMultilineInput('test-input-missing', {
            required: true
          })
        ).toThrow()
      })

      it('Trims whitespace from the input', () => {
        process.env.INPUT_TEST = '  test  \n   muliline   \n   spaces   '
        expect(
          coreStubs.getMultilineInput('test', { trimWhitespace: true })
        ).toMatchObject(['test', 'muliline', 'spaces'])
      })
    })

    describe('getBooleanInput()', () => {
      it('Gets the action inputs', () => {
        // Test both upper and lower case versions of the input
        process.env.INPUT_TEST = 'true'
        expect(coreStubs.getBooleanInput('test')).toBeTruthy()

        delete process.env.INPUT_TEST

        process.env.INPUT_test = 'false'
        expect(coreStubs.getBooleanInput('test')).toBeFalsy()
      })

      it('Throws an error if the input is required and not found', () => {
        expect(() =>
          coreStubs.getBooleanInput('test-input-missing', {
            required: true
          })
        ).toThrow()
      })

      it('Returns true or false for valid YAML boolean values', () => {
        process.env.INPUT_TEST = 'true'
        expect(coreStubs.getBooleanInput('test')).toBeTruthy()

        process.env.INPUT_TEST = 'True'
        expect(coreStubs.getBooleanInput('test')).toBeTruthy()

        process.env.INPUT_TEST = 'TRUE'
        expect(coreStubs.getBooleanInput('test')).toBeTruthy()

        process.env.INPUT_TEST = 'false'
        expect(coreStubs.getBooleanInput('test')).toBeFalsy()

        process.env.INPUT_TEST = 'False'
        expect(coreStubs.getBooleanInput('test')).toBeFalsy()

        process.env.INPUT_TEST = 'FALSE'
        expect(coreStubs.getBooleanInput('test')).toBeFalsy()
      })

      it('Throws an error if the input is not a valid YAML boolean value', () => {
        process.env.INPUT_TEST = 'This is not a valid boolean value'
        expect(() => coreStubs.getBooleanInput('test')).toThrow()
      })
    })

    describe('setOutput()', () => {
      it('Sets the action outputs', () => {
        jest.spyOn(coreStubs.CoreMeta.colors, 'cyan').mockImplementation()

        coreStubs.setOutput('my-output', 'output-value')

        expect(coreStubs.CoreMeta.outputs['my-output']).toEqual('output-value')
      })

      it('Logs the output to the console', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'cyan')
          .mockImplementation()

        coreStubs.setOutput('my-output', 'output-value')

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::set-output name=my-output::output-value'
        )
      })
    })

    describe('setCommandEcho()', () => {
      it('Sets the command echo flag', () => {
        coreStubs.setCommandEcho(true)
        expect(coreStubs.CoreMeta.echo).toBeTruthy()

        coreStubs.setCommandEcho(false)
        expect(coreStubs.CoreMeta.echo).toBeFalsy()
      })
    })

    describe('setFailed()', () => {
      it('Sets the exit code to failure', () => {
        jest.spyOn(coreStubs.CoreMeta.colors, 'red').mockImplementation()

        coreStubs.setFailed('test')

        expect(coreStubs.CoreMeta.exitCode).toEqual(ExitCode.Failure)
        expect(coreStubs.CoreMeta.exitMessage).toEqual('test')
      })
    })

    describe('log()', () => {
      it('Throws an error if startLine and endLine are different when columns are set', () => {
        expect((): void =>
          coreStubs.log('group', 'my message', {
            startLine: 1,
            endLine: 2,
            startColumn: 1
          })
        ).toThrow()

        expect((): void =>
          coreStubs.log('group', 'my message', {
            startLine: 1,
            endLine: 2,
            endColumn: 2
          })
        ).toThrow()
      })

      it('Logs only the color when no message is provided', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'blue')
          .mockImplementation()

        coreStubs.log('group')

        expect(core_outputSpy).toHaveBeenCalledWith('::group::')
      })

      it('Redacts secrets from the output', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'blue')
          .mockImplementation()

        // Set a secret to mask
        coreStubs.CoreMeta.secrets = ['secret-value-1234']

        coreStubs.log('group', 'my secret is secret-value-1234')

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::group::my secret is ****'
        )
      })

      it('Includes annotations in the output', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'blue')
          .mockImplementation()

        coreStubs.log('group', 'my message', {
          title: 'my title',
          file: 'my-file.txt'
        })

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::group title=my title,file=my-file.txt::my message'
        )
      })

      it('Defaults the endLine property to startLine', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'white')
          .mockImplementation()

        coreStubs.log('info', 'my message', {
          startLine: 1
        })

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::info line=1,endLine=1::my message'
        )
      })

      it('Defaults the endColumn property to startColumn', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'white')
          .mockImplementation()

        coreStubs.log('info', 'my message', {
          startColumn: 1
        })

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::info col=1,endColumn=1::my message'
        )
      })
    })

    describe('isDebug()', () => {
      it('Returns the step debug setting', () => {
        coreStubs.CoreMeta.stepDebug = true
        expect(coreStubs.isDebug()).toBeTruthy()

        coreStubs.CoreMeta.stepDebug = false
        expect(coreStubs.isDebug()).toBeFalsy()
      })
    })

    describe('debug()', () => {
      it('Logs to the console if debug logging is enabled', () => {
        // Enable step debug logging
        coreStubs.CoreMeta.stepDebug = true

        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'gray')
          .mockImplementation()

        coreStubs.debug('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::debug::test')
      })

      it('Does not log to the console if debug logging is disabled', () => {
        // Disable step debug logging
        coreStubs.CoreMeta.stepDebug = false

        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'gray')
          .mockImplementation()

        coreStubs.debug('test')

        expect(core_outputSpy).not.toHaveBeenCalled()
      })
    })

    describe('warning()', () => {
      it('Logs to the console', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'yellow')
          .mockImplementation()

        coreStubs.warning('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::warning::test')
      })
    })

    describe('notice()', () => {
      it('Logs to the console', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'magenta')
          .mockImplementation()

        coreStubs.notice('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::notice::test')
      })
    })

    describe('info()', () => {
      it('Logs to the console', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'white')
          .mockImplementation()

        coreStubs.info('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::info::test')
      })
    })

    describe('startGroup()', () => {
      it('Logs to the console', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'blue')
          .mockImplementation()

        coreStubs.startGroup('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::group::test')
      })
    })

    describe('endGroup()', () => {
      it('Logs to the console', () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'blue')
          .mockImplementation()

        coreStubs.endGroup()

        expect(core_outputSpy).toHaveBeenCalledWith('::endgroup::')
      })
    })

    describe('group()', () => {
      it('Logs grouped messages to the console', async () => {
        const core_outputSpy: jest.SpyInstance = jest
          .spyOn(coreStubs.CoreMeta.colors, 'blue')
          .mockImplementation()

        const core_infoSpy: jest.SpyInstance = jest.spyOn(
          coreStubs.CoreMeta.colors,
          'white'
        )

        // eslint-disable-next-line @typescript-eslint/require-await
        await coreStubs.group('my-group', async () => {
          coreStubs.info('test')

          // Do some async work...

          return
        })

        expect(core_outputSpy).toHaveBeenCalledWith('::group::my-group')
        expect(core_infoSpy).toHaveBeenCalledWith('::info::test')
        expect(core_outputSpy).toHaveBeenCalledWith('::endgroup::')
      })
    })

    describe('saveState()', () => {
      it('Saves string data', () => {
        coreStubs.saveState(
          'string-test',
          JSON.stringify({ 'my-state': 'test-string-info' })
        )

        expect(coreStubs.CoreMeta.state).toMatchObject({
          'string-test': '{"my-state":"test-string-info"}'
        })
      })

      it('Saves JSON data', () => {
        coreStubs.saveState('json-test', { 'my-state': 'test-json-info' })

        expect(coreStubs.CoreMeta.state).toMatchObject({
          'json-test': '{"my-state":"test-json-info"}'
        })
      })

      it('Saves null and undefined as empty strings', () => {
        coreStubs.saveState('undefined-test', undefined)
        coreStubs.saveState('null-test', null)

        expect(coreStubs.CoreMeta.state).toMatchObject({
          'undefined-test': '',
          'null-test': ''
        })
      })
    })

    describe('getState()', () => {
      it('Gets the state from the environment', () => {
        coreStubs.CoreMeta.state = {
          test: '{"my-state":"test-info"}'
        }

        expect(coreStubs.getState('test')).toEqual('{"my-state":"test-info"}')
      })

      it('Returns an empty string for values not in the state', () => {
        expect(coreStubs.getState('nonexistent-test')).toEqual('')
      })
    })

    describe('getIDToken()', () => {
      it('Throws an error', async () => {
        await expect(coreStubs.getIDToken()).rejects.toThrow('Not implemented')
      })
    })
  })
})
