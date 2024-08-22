import { jest } from '@jest/globals'
import path from 'path'
import {
  CoreMeta,
  ResetCoreMetadata,
  addPath,
  debug,
  endGroup,
  error,
  exportVariable,
  getBooleanInput,
  getIDToken,
  getInput,
  getMultilineInput,
  getState,
  group,
  info,
  isDebug,
  log,
  notice,
  saveState,
  setCommandEcho,
  setFailed,
  setOutput,
  setSecret,
  startGroup,
  toPlatformPath,
  toPosixPath,
  toWin32Path,
  warning
} from '../../src/stubs/core-stubs.js'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env-stubs.js'
import type { CoreMetadata } from '../../src/types.js'

/** Empty CoreMetadata Object */
const empty: CoreMetadata = {
  exitCode: 0,
  exitMessage: '',
  outputs: {},
  secrets: [],
  stepDebug: process.env.ACTIONS_STEP_DEBUG === 'true',
  stepSummaryPath: process.env.GITHUB_STEP_SUMMARY ?? '',
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

// Prevent output during tests
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'table').mockImplementation(() => {})

describe('Core', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('CoreMeta', () => {
    it('Tracks updates to the core metadata', () => {
      // Initial state should be empty
      expect(CoreMeta.exitCode).toEqual(empty.exitCode)
      expect(CoreMeta.exitMessage).toEqual(empty.exitMessage)
      expect(CoreMeta.outputs).toMatchObject(empty.outputs)
      expect(CoreMeta.secrets).toMatchObject(empty.secrets)
      expect(CoreMeta.stepDebug).toEqual(empty.stepDebug)
      expect(CoreMeta.stepSummaryPath).toEqual(empty.stepSummaryPath)
      expect(CoreMeta.echo).toEqual(empty.echo)
      expect(CoreMeta.state).toMatchObject(empty.state)

      // Update the metadata
      CoreMeta.exitCode = 1
      CoreMeta.exitMessage = 'test'
      CoreMeta.outputs = { 'my-output': 'test' }
      CoreMeta.secrets = ['secret-value-1234']
      CoreMeta.stepDebug = true
      CoreMeta.stepSummaryPath = 'test'
      CoreMeta.echo = true
      CoreMeta.state = { 'my-state': 'test' }

      // Verify the updated metadata
      expect(CoreMeta.exitCode).toEqual(1)
      expect(CoreMeta.exitMessage).toEqual('test')
      expect(CoreMeta.outputs).toMatchObject({ 'my-output': 'test' })
      expect(CoreMeta.secrets).toMatchObject(['secret-value-1234'])
      expect(CoreMeta.stepDebug).toEqual(true)
      expect(CoreMeta.stepSummaryPath).toEqual('test')
      expect(CoreMeta.echo).toEqual(true)
      expect(CoreMeta.state).toMatchObject({ 'my-state': 'test' })

      // Reset the metadata
      ResetCoreMetadata()

      // Verify the reset metadata
      expect(CoreMeta.exitCode).toEqual(empty.exitCode)
      expect(CoreMeta.exitMessage).toEqual(empty.exitMessage)
      expect(CoreMeta.outputs).toMatchObject(empty.outputs)
      expect(CoreMeta.secrets).toMatchObject(empty.secrets)
      expect(CoreMeta.stepDebug).toEqual(empty.stepDebug)
      expect(CoreMeta.stepSummaryPath).toEqual(empty.stepSummaryPath)
      expect(CoreMeta.echo).toEqual(empty.echo)
      expect(CoreMeta.state).toMatchObject(empty.state)
    })

    it('Defaults stepSummaryPath to an empty string', () => {
      delete process.env.GITHUB_STEP_SUMMARY

      ResetCoreMetadata()
      expect(CoreMeta.stepSummaryPath).toEqual('')
    })

    it('Sets stepSummaryPath from the environment', () => {
      process.env.GITHUB_STEP_SUMMARY = 'summary.md'

      ResetCoreMetadata()
      expect(CoreMeta.stepSummaryPath).toEqual('summary.md')
    })
  })

  describe('Core Stubs', () => {
    describe('exportVariable()', () => {
      it('Exports an environment variable', () => {
        exportVariable('TEST', 'test')
        expect(EnvMeta.env).toMatchObject({ TEST: 'test' })
      })

      it('Exports undefined and null as empty strings', () => {
        exportVariable('UNDEFINED_TEST', undefined)
        exportVariable('NULL_TEST', undefined)
        expect(EnvMeta.env).toMatchObject({ UNDEFINED_TEST: '', NULL_TEST: '' })
      })

      it('Exports objects as stringified JSON', () => {
        const testVariable = {
          my_key: 'my_value'
        }

        exportVariable('TEST', testVariable)
        expect(EnvMeta.env).toMatchObject({
          TEST: JSON.stringify(testVariable)
        })
      })
    })

    describe('setSecre()', () => {
      it('Sets a secret to mask', () => {
        setSecret('test')
        expect(CoreMeta.secrets).toMatchObject(['test'])
      })
    })

    describe('addPath()', () => {
      it('Appends to the path', () => {
        addPath('/usr/test')
        expect(EnvMeta.path.includes('/usr/test')).toBeTruthy()
      })
    })

    describe('getInput()', () => {
      it('Gets action inputs', () => {
        // Test both upper and lower case versions of the input
        process.env.INPUT_TEST = 'test-upper'
        expect(getInput('test')).toEqual('test-upper')

        delete process.env.INPUT_TEST

        process.env.INPUT_test = 'test-lower'
        expect(getInput('test')).toEqual('test-lower')
      })

      it('Returns an empty string', () => {
        expect(getInput('test-input-missing')).toEqual('')
      })

      it('Throws an error if the input is required and not found', () => {
        expect(() =>
          getInput('test-input-missing', { required: true })
        ).toThrow()
      })

      it('Trims whitespace', () => {
        process.env.INPUT_TEST = '  test  '
        expect(getInput('test', { trimWhitespace: true })).toEqual('test')
      })
    })

    describe('getMultilineInput()', () => {
      it('Gets action inputs', () => {
        // Test both upper and lower case versions of the input
        process.env.INPUT_TEST = `test\nmultiline\nupper`
        expect(getMultilineInput('test')).toMatchObject([
          'test',
          'multiline',
          'upper'
        ])

        delete process.env.INPUT_TEST

        process.env.INPUT_test = `test\nmultiline\nlower`
        expect(getMultilineInput('test')).toMatchObject([
          'test',
          'multiline',
          'lower'
        ])
      })

      it('Returns an empty list if the input is not found', () => {
        expect(getMultilineInput('test-input-missing')).toMatchObject([])
      })

      it('Throws an error if the input is required and not found', () => {
        expect(() =>
          getMultilineInput('test-input-missing', {
            required: true
          })
        ).toThrow()
      })

      it('Trims whitespace from the input', () => {
        process.env.INPUT_TEST = '  test  \n   muliline   \n   spaces   '
        expect(
          getMultilineInput('test', { trimWhitespace: true })
        ).toMatchObject(['test', 'muliline', 'spaces'])
      })
    })

    describe('getBooleanInput()', () => {
      it('Gets the action inputs', () => {
        // Test both upper and lower case versions of the input
        process.env.INPUT_TEST = 'true'
        expect(getBooleanInput('test')).toBeTruthy()

        delete process.env.INPUT_TEST

        process.env.INPUT_test = 'false'
        expect(getBooleanInput('test')).toBeFalsy()
      })

      it('Throws an error if the input is required and not found', () => {
        expect(() =>
          getBooleanInput('test-input-missing', {
            required: true
          })
        ).toThrow()
      })

      it('Returns true or false for valid YAML boolean values', () => {
        process.env.INPUT_TEST = 'true'
        expect(getBooleanInput('test')).toBeTruthy()

        process.env.INPUT_TEST = 'True'
        expect(getBooleanInput('test')).toBeTruthy()

        process.env.INPUT_TEST = 'TRUE'
        expect(getBooleanInput('test')).toBeTruthy()

        process.env.INPUT_TEST = 'false'
        expect(getBooleanInput('test')).toBeFalsy()

        process.env.INPUT_TEST = 'False'
        expect(getBooleanInput('test')).toBeFalsy()

        process.env.INPUT_TEST = 'FALSE'
        expect(getBooleanInput('test')).toBeFalsy()
      })

      it('Throws an error if the input is not a valid YAML boolean value', () => {
        process.env.INPUT_TEST = 'This is not a valid boolean value'
        expect(() => getBooleanInput('test')).toThrow()
      })
    })

    describe('setOutput()', () => {
      it('Sets the action outputs', () => {
        jest.spyOn(CoreMeta.colors, 'cyan').mockImplementation(() => {})

        setOutput('my-output', 'output-value')

        expect(CoreMeta.outputs['my-output']).toEqual('output-value')
      })

      it('Logs the output to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'cyan')
          .mockImplementation(() => {})

        setOutput('my-output', 'output-value')

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::set-output name=my-output::output-value'
        )
      })
    })

    describe('setCommandEcho()', () => {
      it('Sets the command echo flag', () => {
        setCommandEcho(true)
        expect(CoreMeta.echo).toBeTruthy()

        setCommandEcho(false)
        expect(CoreMeta.echo).toBeFalsy()
      })
    })

    describe('setFailed()', () => {
      it('Sets the exit code to failure', () => {
        jest.spyOn(CoreMeta.colors, 'red').mockImplementation(() => {})

        setFailed('test')

        expect(CoreMeta.exitCode).toEqual(1)
        expect(CoreMeta.exitMessage).toEqual('test')
      })
    })

    describe('log()', () => {
      it('Throws an error if startLine and endLine are different when columns are set', () => {
        expect((): void =>
          log('group', 'my message', {
            startLine: 1,
            endLine: 2,
            startColumn: 1
          })
        ).toThrow()

        expect((): void =>
          log('group', 'my message', {
            startLine: 1,
            endLine: 2,
            endColumn: 2
          })
        ).toThrow()
      })

      it('Logs only the color when no message is provided', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'blue')
          .mockImplementation(() => {})

        log('group')

        expect(core_outputSpy).toHaveBeenCalledWith('::group::')
      })

      it('Redacts secrets from the output', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'blue')
          .mockImplementation(() => {})

        // Set a secret to mask
        CoreMeta.secrets = ['secret-value-1234']

        log('group', 'my secret is secret-value-1234')

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::group::my secret is ****'
        )
      })

      it('Includes annotations in the output', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'blue')
          .mockImplementation(() => {})

        log('group', 'my message', {
          title: 'my title',
          file: 'my-file.txt'
        })

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::group title=my title,file=my-file.txt::my message'
        )
      })

      it('Defaults the endLine property to startLine', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'white')
          .mockImplementation(() => {})

        log('info', 'my message', {
          startLine: 1
        })

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::info line=1,endLine=1::my message'
        )
      })

      it('Defaults the endColumn property to startColumn', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'white')
          .mockImplementation(() => {})

        log('info', 'my message', {
          startColumn: 1
        })

        expect(core_outputSpy).toHaveBeenCalledWith(
          '::info col=1,endColumn=1::my message'
        )
      })
    })

    describe('isDebug()', () => {
      it('Returns the step debug setting', () => {
        CoreMeta.stepDebug = true
        expect(isDebug()).toBeTruthy()

        CoreMeta.stepDebug = false
        expect(isDebug()).toBeFalsy()
      })
    })

    describe('debug()', () => {
      it('Logs to the console if debug logging is enabled', () => {
        // Enable step debug logging
        CoreMeta.stepDebug = true

        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'gray')
          .mockImplementation(() => {})

        debug('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::debug::test')
      })

      it('Does not log to the console if debug logging is disabled', () => {
        // Disable step debug logging
        CoreMeta.stepDebug = false

        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'gray')
          .mockImplementation(() => {})

        debug('test')

        expect(core_outputSpy).not.toHaveBeenCalled()
      })
    })

    describe('error()', () => {
      it('Logs to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'red')
          .mockImplementation(() => {})

        error('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::error::test')
      })
    })

    describe('warning()', () => {
      it('Logs to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'yellow')
          .mockImplementation(() => {})

        warning('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::warning::test')
      })
    })

    describe('notice()', () => {
      it('Logs to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'magenta')
          .mockImplementation(() => {})

        notice('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::notice::test')
      })
    })

    describe('info()', () => {
      it('Logs to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'white')
          .mockImplementation(() => {})

        info('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::info::test')
      })
    })

    describe('startGroup()', () => {
      it('Logs to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'blue')
          .mockImplementation(() => {})

        startGroup('test')

        expect(core_outputSpy).toHaveBeenCalledWith('::group::test')
      })
    })

    describe('endGroup()', () => {
      it('Logs to the console', () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'blue')
          .mockImplementation(() => {})

        endGroup()

        expect(core_outputSpy).toHaveBeenCalledWith('::endgroup::')
      })
    })

    describe('group()', () => {
      it('Logs grouped messages to the console', async () => {
        const core_outputSpy = jest
          .spyOn(CoreMeta.colors, 'blue')
          .mockImplementation(() => {})

        const core_infoSpy = jest.spyOn(CoreMeta.colors, 'white')

        await group('my-group', async () => {
          info('test')

          await Promise.resolve()

          return
        })

        expect(core_outputSpy).toHaveBeenCalledWith('::group::my-group')
        expect(core_infoSpy).toHaveBeenCalledWith('::info::test')
        expect(core_outputSpy).toHaveBeenCalledWith('::endgroup::')
      })
    })

    describe('saveState()', () => {
      it('Saves string data', () => {
        saveState(
          'string-test',
          JSON.stringify({ 'my-state': 'test-string-info' })
        )

        expect(CoreMeta.state).toMatchObject({
          'string-test': '{"my-state":"test-string-info"}'
        })
      })

      it('Saves JSON data', () => {
        saveState('json-test', { 'my-state': 'test-json-info' })

        expect(CoreMeta.state).toMatchObject({
          'json-test': '{"my-state":"test-json-info"}'
        })
      })

      it('Saves null and undefined as empty strings', () => {
        saveState('undefined-test', undefined)
        saveState('null-test', null)

        expect(CoreMeta.state).toMatchObject({
          'undefined-test': '',
          'null-test': ''
        })
      })
    })

    describe('getState()', () => {
      it('Gets the state from the environment', () => {
        CoreMeta.state = {
          test: '{"my-state":"test-info"}'
        }

        expect(getState('test')).toEqual('{"my-state":"test-info"}')
      })

      it('Returns an empty string for values not in the state', () => {
        expect(getState('nonexistent-test')).toEqual('')
      })
    })

    describe('getIDToken()', () => {
      it('Throws an error', async () => {
        await expect(getIDToken()).rejects.toThrow('Not implemented')
      })
    })

    describe('toPosixPath()', () => {
      it('Returns a POSIX path', () => {
        expect(toPosixPath('C:\\Users\\mona\\Desktop')).toEqual(
          'C:/Users/mona/Desktop'
        )
      })
    })

    describe('toWin32Path()', () => {
      it('Returns a WIN32 path', () => {
        expect(toWin32Path('C:/Users/mona/Desktop')).toEqual(
          'C:\\Users\\mona\\Desktop'
        )
      })
    })

    describe('toPlatformPath()', () => {
      it('Returns a platform-specific path', () => {
        expect(toPlatformPath('C:/Users/mona/Desktop')).toEqual(
          `C:${path.sep}Users${path.sep}mona${path.sep}Desktop`
        )

        expect(toPosixPath('C:\\Users\\mona\\Desktop')).toEqual(
          `C:${path.sep}Users${path.sep}mona${path.sep}Desktop`
        )
      })
    })
  })
})
