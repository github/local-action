import * as coreStubs from '../../src/stubs/core-stubs'
import * as envStubs from '../../src/stubs/env-stubs'
import type { EnvMetadata } from '../../src/types'

/** Empty EnvMetadata Object */
const empty: EnvMetadata = {
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
}

describe('Env', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
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

  describe('EnvMeta', () => {
    it('Tracks updates to the environment metadata', () => {
      // Initial state should be empty
      expect(envStubs.EnvMeta).toMatchObject(empty)

      // Update the metadata
      envStubs.EnvMeta.actionFile = 'action.yml'
      envStubs.EnvMeta.actionPath = '/some/path'
      envStubs.EnvMeta.entrypoint = 'index.ts'
      envStubs.EnvMeta.env = { TEST: 'test' }
      envStubs.EnvMeta.envBackup = { TEST: 'testBackup' }
      envStubs.EnvMeta.envFile = '.env'
      envStubs.EnvMeta.inputs = { input: { description: 'test input' } }
      envStubs.EnvMeta.outputs = { output: { description: 'test output' } }
      envStubs.EnvMeta.path = '/usr/bin'
      envStubs.EnvMeta.pathBackup = '/usr/bin/backup'

      // Verify the updated metadata
      expect(envStubs.EnvMeta).toMatchObject({
        actionFile: 'action.yml',
        actionPath: '/some/path',
        entrypoint: 'index.ts',
        env: { TEST: 'test' },
        envBackup: { TEST: 'testBackup' },
        envFile: '.env',
        inputs: { input: { description: 'test input' } },
        outputs: { output: { description: 'test output' } },
        path: '/usr/bin',
        pathBackup: '/usr/bin/backup'
      })

      // Reset the metadata
      envStubs.ResetEnvMetadata()

      // Verify the reset metadata
      expect(envStubs.EnvMeta).toMatchObject(empty)
    })
  })
})
