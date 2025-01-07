import { jest } from '@jest/globals'
import { ResetCoreMetadata } from '../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env.js'
import type { EnvMetadata } from '../../src/types.js'

/** Empty EnvMetadata Object */
const empty: EnvMetadata = {
  actionFile: '',
  actionPath: '',
  artifacts: [],
  dotenvFile: '',
  entrypoint: '',
  env: {},
  inputs: {},
  outputs: {},
  path: ''
}

// Prevent output during tests
jest.spyOn(console, 'log').mockImplementation(() => {})

describe('Env', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('EnvMeta', () => {
    it('Tracks updates to the environment metadata', () => {
      // Initial state should be empty
      expect(EnvMeta).toMatchObject(empty)

      // Update the metadata
      EnvMeta.actionFile = 'action.yml'
      EnvMeta.actionPath = '/some/path'
      EnvMeta.artifacts = [{ id: 1, name: 'test', size: 0 }]
      EnvMeta.dotenvFile = '.env'
      EnvMeta.entrypoint = 'main.ts'
      EnvMeta.env = { TEST: 'test' }
      EnvMeta.inputs = { input: { description: 'test input' } }
      EnvMeta.outputs = { output: { description: 'test output' } }
      EnvMeta.path = '/usr/bin'

      // Verify the updated metadata
      expect(EnvMeta).toMatchObject({
        actionFile: 'action.yml',
        actionPath: '/some/path',
        artifacts: [{ id: 1, name: 'test', size: 0 }],
        dotenvFile: '.env',
        entrypoint: 'main.ts',
        env: { TEST: 'test' },
        inputs: { input: { description: 'test input' } },
        outputs: { output: { description: 'test output' } },
        path: '/usr/bin'
      })

      // Reset the metadata
      ResetEnvMetadata()

      // Verify the reset metadata
      expect(EnvMeta).toMatchObject(empty)
    })
  })
})
