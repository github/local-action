/**
 * Unit tests for the tool's environment metadata utilities
 */

import { expect } from 'chai'
import { restore } from 'sinon'

import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env'
import { ResetCoreMetadata } from '../../src/stubs/core'

describe('EnvMeta', () => {
  beforeEach(() => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  it('Tracks updates to the environment metadata', () => {
    expect(EnvMeta).to.deep.equal({
      actionFile: '',
      actionPath: '',
      entrypoint: '',
      env: {},
      envBackup: {},
      envFile: '',
      inputs: {},
      outputs: {},
      path: '',
      pathBackup: ''
    })

    EnvMeta.actionFile = 'action.yml'
    EnvMeta.actionPath = '/some/path'
    EnvMeta.entrypoint = 'index.js'
    EnvMeta.env = { TEST: 'test' }
    EnvMeta.envBackup = { TEST: 'testBackup' }
    EnvMeta.envFile = '.env'
    EnvMeta.inputs = { input: { description: 'test input' } }
    EnvMeta.outputs = { output: { description: 'test output' } }
    EnvMeta.path = '/usr/bin'
    EnvMeta.pathBackup = '/usr/bin/backup'

    expect(EnvMeta).to.deep.equal({
      actionFile: 'action.yml',
      actionPath: '/some/path',
      entrypoint: 'index.js',
      env: { TEST: 'test' },
      envBackup: { TEST: 'testBackup' },
      envFile: '.env',
      inputs: { input: { description: 'test input' } },
      outputs: { output: { description: 'test output' } },
      path: '/usr/bin',
      pathBackup: '/usr/bin/backup'
    })

    ResetEnvMetadata()

    expect(EnvMeta).to.deep.equal({
      actionFile: '',
      actionPath: '',
      entrypoint: '',
      env: {},
      envBackup: {},
      envFile: '',
      inputs: {},
      outputs: {},
      path: '',
      pathBackup: ''
    })
  })
})
