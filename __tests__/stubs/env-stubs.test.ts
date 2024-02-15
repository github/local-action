import { ResetCoreMetadata } from '../../src/stubs/core-stubs'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env-stubs'
import type { EnvMetadata } from '../../src/types'

/** Empty EnvMetadata Object */
const empty: EnvMetadata = {
  actionFile: '',
  actionPath: '',
  dotenvFile: '',
  entrypoint: '',
  env: {},
  envBackup: {},
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
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('EnvMeta', () => {
    it('Tracks updates to the environment metadata', () => {
      // Initial state should be empty
      expect(EnvMeta).toMatchObject(empty)

      // Update the metadata
      EnvMeta.actionFile = 'action.yml'
      EnvMeta.actionPath = '/some/path'
      EnvMeta.dotenvFile = '.env'
      EnvMeta.entrypoint = 'index.ts'
      EnvMeta.env = { TEST: 'test' }
      EnvMeta.envBackup = { TEST: 'testBackup' }
      EnvMeta.inputs = { input: { description: 'test input' } }
      EnvMeta.outputs = { output: { description: 'test output' } }
      EnvMeta.path = '/usr/bin'
      EnvMeta.pathBackup = '/usr/bin/backup'

      // Verify the updated metadata
      expect(EnvMeta).toMatchObject({
        actionFile: 'action.yml',
        actionPath: '/some/path',
        dotenvFile: '.env',
        entrypoint: 'index.ts',
        env: { TEST: 'test' },
        envBackup: { TEST: 'testBackup' },
        inputs: { input: { description: 'test input' } },
        outputs: { output: { description: 'test output' } },
        path: '/usr/bin',
        pathBackup: '/usr/bin/backup'
      })

      // Reset the metadata
      ResetEnvMetadata()

      // Verify the reset metadata
      expect(EnvMeta).toMatchObject(empty)
    })
  })
})
