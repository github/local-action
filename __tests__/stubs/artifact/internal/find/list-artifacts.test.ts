import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/core.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../../src/stubs/env.js'

jest.unstable_mockModule('@actions/core', () => core)

const listArtifacts = await import(
  '../../../../../src/stubs/artifact/internal/find/list-artifacts.js'
)

describe('list-artifacts', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('listArtifactsInternal', () => {
    it('Lists artifacts', async () => {
      EnvMeta.artifacts = [{ name: 'artifact-name', id: 1, size: 0 }]

      const response = await listArtifacts.listArtifactsInternal()

      expect(response.artifacts.length).toBe(1)
    })

    it('Only returns the latest artifacts', async () => {
      EnvMeta.artifacts = [
        { name: 'artifact-name', id: 1, size: 0 },
        { name: 'artifact-name', id: 2, size: 0 },
        { name: 'artifact-name-2', id: 3, size: 0 }
      ]

      const response = await listArtifacts.listArtifactsInternal(true)

      expect(response.artifacts.length).toBe(2)
    })
  })
})
