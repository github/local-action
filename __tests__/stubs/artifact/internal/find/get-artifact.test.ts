import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/core.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../../src/stubs/env.js'

jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)

const getArtifact = await import(
  '../../../../../src/stubs/artifact/internal/find/get-artifact.js'
)

describe('get-artifact', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('getArtifactInternal', () => {
    it('Gets an artifact', async () => {
      EnvMeta.artifacts = [{ name: 'artifact-name', id: 1, size: 0 }]

      const response = await getArtifact.getArtifactInternal('artifact-name')

      expect(response.artifact).toMatchObject({
        name: 'artifact-name',
        id: 1,
        size: 0
      })
    })

    it('Gets the latest artifact', async () => {
      EnvMeta.artifacts = [
        { name: 'artifact-name', id: 1, size: 0 },
        { name: 'artifact-name', id: 2, size: 0 }
      ]

      const response = await getArtifact.getArtifactInternal('artifact-name')

      expect(response.artifact).toMatchObject({
        name: 'artifact-name',
        id: 2,
        size: 0
      })
    })

    it('Throws if no matching artifact is found', async () => {
      await expect(
        getArtifact.getArtifactInternal('artifact-name')
      ).rejects.toThrow()
    })
  })
})
