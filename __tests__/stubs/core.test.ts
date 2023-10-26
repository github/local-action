/**
 * Unit tests for the tool's environment metadata utilities
 */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { restore, stub } from 'sinon'

import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env'
import { CoreMeta, CoreStubs, ResetCoreMetadata } from '../../src/stubs/core'
import { ExitCode } from '../../src/interfaces'

chai.use(chaiAsPromised)
const { expect } = chai

describe('CoreMeta', () => {
  beforeEach(() => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  it('Tracks updates to the core metadata', () => {
    expect(CoreMeta.exitCode).to.equal(ExitCode.Success)
    expect(CoreMeta.exitMessage).to.equal('')
    expect(CoreMeta.outputs).to.deep.equal({})
    expect(CoreMeta.secrets.length).to.equal(0)
    expect(CoreMeta.stepDebug).to.equal(
      process.env.ACTIONS_STEP_DEBUG === 'true'
    )
    expect(CoreMeta.echo).to.be.false
    expect(CoreMeta.state).to.deep.equal({})

    CoreMeta.exitCode = ExitCode.Failure
    CoreMeta.exitMessage = 'test'
    CoreMeta.outputs = { 'my-output': 'test' }
    CoreMeta.secrets = ['secret-value-1234']
    CoreMeta.stepDebug = true
    CoreMeta.echo = true
    CoreMeta.state = { 'my-state': 'test' }

    expect(CoreMeta.exitCode).to.equal(ExitCode.Failure)
    expect(CoreMeta.exitMessage).to.equal('test')
    expect(CoreMeta.outputs).to.deep.equal({ 'my-output': 'test' })
    expect(CoreMeta.secrets).to.deep.equal(['secret-value-1234'])
    expect(CoreMeta.stepDebug).to.be.true
    expect(CoreMeta.echo).to.be.true
    expect(CoreMeta.state).to.deep.equal({ 'my-state': 'test' })

    ResetCoreMetadata()

    expect(CoreMeta.exitCode).to.equal(ExitCode.Success)
    expect(CoreMeta.exitMessage).to.equal('')
    expect(CoreMeta.outputs).to.deep.equal({})
    expect(CoreMeta.secrets.length).to.equal(0)
    expect(CoreMeta.stepDebug).to.equal(
      process.env.ACTIONS_STEP_DEBUG === 'true'
    )
    expect(CoreMeta.echo).to.be.false
    expect(CoreMeta.state).to.deep.equal({})
  })
})

describe('CoreStubs', () => {
  beforeEach(() => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  describe('exportVariable', () => {
    it('Adds the variable to the environment', () => {
      CoreStubs.exportVariable('TEST', 'test')

      expect(EnvMeta.env).to.deep.equal({ TEST: 'test' })
    })
  })

  describe('setSecret', () => {
    it('Adds the secret to the environment', () => {
      CoreStubs.setSecret('test')

      expect(CoreMeta.secrets).to.deep.equal(['test'])
    })
  })

  describe('addPath', () => {
    it('Adds the path to the environment', () => {
      CoreStubs.addPath('/usr/test')

      expect(EnvMeta.path.includes('/usr/test')).to.be.true
    })
  })

  describe('getInput', () => {
    // eslint-disable-next-line no-undef
    let envBackup: NodeJS.ProcessEnv = process.env

    beforeEach(() => {
      envBackup = process.env
    })
    afterEach(() => {
      process.env = envBackup
    })

    it('Gets the input from environment variables', () => {
      // Test both upper and lower case versions of the input
      process.env.INPUT_TEST = 'test-upper'
      expect(CoreStubs.getInput('test')).to.equal('test-upper')

      delete process.env.INPUT_TEST
      process.env.INPUT_test = 'test-lower'

      expect(CoreStubs.getInput('test')).to.equal('test-lower')
    })

    it('Returns an empty string if the input is not found', () => {
      expect(CoreStubs.getInput('test-input-missing')).to.equal('')
    })

    it('Throws an error if the input is required and not found', () => {
      expect(() =>
        CoreStubs.getInput('test-input-missing', { required: true })
      ).to.throw()
    })

    it('Trims whitespace from the input', () => {
      process.env.INPUT_TEST = '  test  '
      expect(CoreStubs.getInput('test', { trimWhitespace: true })).to.equal(
        'test'
      )
    })
  })

  describe('getMultilineInput', () => {
    // eslint-disable-next-line no-undef
    let envBackup: NodeJS.ProcessEnv = process.env

    beforeEach(() => {
      envBackup = process.env
    })
    afterEach(() => {
      process.env = envBackup
    })

    it('Gets the input from environment variables', () => {
      // Test both upper and lower case versions of the input
      process.env.INPUT_TEST = `test\nmultiline\nupper`
      expect(CoreStubs.getMultilineInput('test')).to.deep.equal([
        'test',
        'multiline',
        'upper'
      ])

      delete process.env.INPUT_TEST
      process.env.INPUT_test = `test\nmultiline\nlower`

      expect(CoreStubs.getMultilineInput('test')).to.deep.equal([
        'test',
        'multiline',
        'lower'
      ])
    })

    it('Returns an empty list if the input is not found', () => {
      expect(CoreStubs.getMultilineInput('test-input-missing')).to.deep.equal(
        []
      )
    })

    it('Throws an error if the input is required and not found', () => {
      expect(() =>
        CoreStubs.getMultilineInput('test-input-missing', { required: true })
      ).to.throw()
    })

    it('Trims whitespace from the input', () => {
      process.env.INPUT_TEST = '  test  \n   muliline   \n   spaces   '
      expect(
        CoreStubs.getMultilineInput('test', { trimWhitespace: true })
      ).to.deep.equal(['test', 'muliline', 'spaces'])
    })
  })

  describe('getBooleanInput', () => {
    // eslint-disable-next-line no-undef
    let envBackup: NodeJS.ProcessEnv = process.env

    beforeEach(() => {
      envBackup = process.env
    })
    afterEach(() => {
      process.env = envBackup
    })

    it('Gets the input from environment variables', () => {
      // Test both upper and lower case versions of the input
      process.env.INPUT_TEST = 'true'
      expect(CoreStubs.getBooleanInput('test')).to.be.true

      delete process.env.INPUT_TEST
      process.env.INPUT_test = 'false'

      expect(CoreStubs.getBooleanInput('test')).to.be.false
    })

    it('Throws an error if the input is required and not found', () => {
      expect(() =>
        CoreStubs.getBooleanInput('test-input-missing', { required: true })
      ).to.throw()
    })

    it('Returns true or false for valid YAML boolean values', () => {
      process.env.INPUT_TEST = 'true'
      expect(CoreStubs.getBooleanInput('test')).to.be.true
      process.env.INPUT_TEST = 'True'
      expect(CoreStubs.getBooleanInput('test')).to.be.true
      process.env.INPUT_TEST = 'TRUE'
      expect(CoreStubs.getBooleanInput('test')).to.be.true
      process.env.INPUT_TEST = 'false'
      expect(CoreStubs.getBooleanInput('test')).to.be.false
      process.env.INPUT_TEST = 'False'
      expect(CoreStubs.getBooleanInput('test')).to.be.false
      process.env.INPUT_TEST = 'FALSE'
      expect(CoreStubs.getBooleanInput('test')).to.be.false
    })

    it('Throws an error if the input is not a valid YAML boolean value', () => {
      process.env.INPUT_TEST = 'This is not a valid boolean value'
      expect(() => CoreStubs.getBooleanInput('test')).to.throw()
    })
  })

  describe('setOutput', () => {
    it('Adds the output to the environment', () => {
      stub(CoreMeta.colors, 'cyan')
      CoreStubs.setOutput('my-output', 'output-value')

      expect(CoreMeta.outputs['my-output']).to.equal('output-value')
    })

    it('Logs the output to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'cyan')
      CoreStubs.setOutput('my-output', 'output-value')

      expect(
        outputStub.calledOnceWith('::set-output name=my-output::output-value')
      ).to.be.true
    })
  })

  describe('setCommandEcho', () => {
    it('Sets the command echo flag', () => {
      CoreStubs.setCommandEcho(true)
      expect(CoreMeta.echo).to.be.true

      CoreStubs.setCommandEcho(false)
      expect(CoreMeta.echo).to.be.false
    })
  })

  describe('setFailed', () => {
    it('Sets the exit code to failure', () => {
      stub(CoreMeta.colors, 'red')
      CoreStubs.setFailed('test')

      expect(CoreMeta.exitCode).to.equal(ExitCode.Failure)
      expect(CoreMeta.exitMessage).to.equal('test')
    })

    it('Logs the error to the console', () => {
      const outputStub = stub(CoreStubs, 'error')
      CoreStubs.setFailed('test')

      expect(outputStub.calledOnceWith('test')).to.be.true
    })
  })

  describe('log', () => {
    it('Throws an error if startLine and endLine are different when columns are set', () => {
      expect(() =>
        CoreStubs.log('group', 'my message', {
          startLine: 1,
          endLine: 2,
          startColumn: 1
        })
      ).to.throw()

      expect(() =>
        CoreStubs.log('group', 'my message', {
          startLine: 1,
          endLine: 2,
          endColumn: 2
        })
      ).to.throw()
    })

    it('Logs only the color when no message is provided', () => {
      const outputStub = stub(CoreMeta.colors, 'blue')
      CoreStubs.log('group')

      expect(outputStub.calledOnceWith('::group::')).to.be.true
      outputStub.restore()
    })

    it('Redacts secrets from the output', () => {
      CoreMeta.secrets = ['secret-value-1234']
      const outputStub = stub(CoreMeta.colors, 'blue')
      CoreStubs.log('group', 'my secret is secret-value-1234')

      expect(outputStub.calledOnceWith('::group::my secret is ****')).to.be.true
      outputStub.restore()
    })

    it('Includes annotations in the log output', () => {
      const outputStub = stub(CoreMeta.colors, 'blue')
      CoreStubs.log('group', 'my message', {
        title: 'my title',
        file: 'my-file.txt'
      })

      expect(
        outputStub.calledOnceWith(
          '::group title=my title,file=my-file.txt::my message'
        )
      ).to.be.true
      outputStub.restore()
    })

    it('Defaults endLine annotation property to startLine', () => {
      const outputStub = stub(CoreMeta.colors, 'white')
      CoreStubs.log('info', 'my message', {
        startLine: 1
      })

      expect(outputStub.calledOnceWith('::info line=1,endLine=1::my message'))
        .to.be.true
      outputStub.restore()
    })

    it('Defaults endColumn annotation property to startColumn', () => {
      const outputStub = stub(CoreMeta.colors, 'white')
      CoreStubs.log('info', 'my message', {
        startColumn: 1
      })

      expect(outputStub.calledOnceWith('::info col=1,endColumn=1::my message'))
        .to.be.true
      outputStub.restore()
    })
  })

  describe('isDebug', () => {
    it('Returns the step debug setting', () => {
      CoreMeta.stepDebug = true
      expect(CoreStubs.isDebug()).to.be.true

      CoreMeta.stepDebug = false
      expect(CoreStubs.isDebug()).to.be.false
    })
  })

  describe('debug', () => {
    it('Logs the message to the console', () => {
      CoreMeta.stepDebug = true
      const outputStub = stub(CoreMeta.colors, 'gray')
      CoreStubs.debug('test')

      expect(outputStub.calledOnceWith('::debug::test')).to.be.true
    })

    it('Does not log the message to the console if step debug is disabled', () => {
      CoreMeta.stepDebug = false
      const outputStub = stub(CoreMeta.colors, 'gray')

      CoreStubs.debug('test')

      expect(outputStub.called).to.be.false
    })
  })

  describe('error', () => {
    it('Logs the message to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'red')
      CoreStubs.error('test')

      expect(outputStub.calledOnceWith('::error::test')).to.be.true
    })
  })

  describe('warning', () => {
    it('Logs the message to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'yellow')
      CoreStubs.warning('test')

      expect(outputStub.calledOnceWith('::warning::test')).to.be.true
    })
  })

  describe('notice', () => {
    it('Logs the message to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'magenta')
      CoreStubs.notice('test')

      expect(outputStub.calledOnceWith('::notice::test')).to.be.true
    })
  })

  describe('info', () => {
    it('Logs the message to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'white')
      CoreStubs.info('test')

      expect(outputStub.calledOnceWith('::info::test')).to.be.true
    })
  })

  describe('startGroup', () => {
    it('Logs the message to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'blue')
      CoreStubs.startGroup('test')

      expect(outputStub.calledOnceWith('::group::test')).to.be.true
    })
  })

  describe('endGroup', () => {
    it('Logs the message to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'blue')
      CoreStubs.endGroup()

      expect(outputStub.calledOnceWith('::endgroup::')).to.be.true
    })
  })

  describe('group', () => {
    it('Logs multiple grouped messages to the console', () => {
      const outputStub = stub(CoreMeta.colors, 'blue')
      stub(CoreMeta.colors, 'white')

      CoreStubs.group('my-group', async () => {
        CoreStubs.info('test')
        return Promise.resolve()
        // eslint-disable-next-line github/no-then
      }).then(() => {
        expect(outputStub.calledOnceWith('::group::my-group')).to.be.true
        expect(outputStub.calledOnceWith('::info::test')).to.be.true
        expect(outputStub.calledOnceWith('::endgroup::')).to.be.true
      })
    })
  })

  describe('saveState', () => {
    it('Saves the state to the environment', () => {
      CoreStubs.saveState(
        'string-test',
        JSON.stringify({ 'my-state': 'test-string-info' })
      )
      CoreStubs.saveState('json-test', { 'my-state': 'test-json-info' })

      expect(CoreMeta.state).to.deep.equal({
        'string-test': '{"my-state":"test-string-info"}',
        'json-test': '{"my-state":"test-json-info"}'
      })
    })

    it('Saves an empty string for null or undefined values', () => {
      CoreStubs.saveState('undefined-test', undefined)
      CoreStubs.saveState('null-test', null)

      expect(CoreMeta.state).to.deep.equal({
        'undefined-test': '',
        'null-test': ''
      })
    })
  })

  describe('getState', () => {
    it('Gets the state from the environment', () => {
      CoreMeta.state = {
        test: '{"my-state":"test-info"}'
      }

      expect(CoreStubs.getState('test')).to.equal('{"my-state":"test-info"}')
    })

    it('Returns an empty string for values not in the state', () => {
      expect(CoreStubs.getState('nonexistent-test')).to.equal('')
    })
  })

  describe('getIDToken', () => {
    it('Throws an error', async () => {
      await expect(CoreStubs.getIDToken()).to.be.rejected
    })
  })
})
