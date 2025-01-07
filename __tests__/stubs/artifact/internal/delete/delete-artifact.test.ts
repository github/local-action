import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/core.js'
import * as fs from '../../../../../__fixtures__/fs.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../../src/stubs/env.js'

jest.unstable_mockModule('fs', () => fs)
jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)

const deleteArtifact = await import(
  '../../../../../src/stubs/artifact/internal/delete/delete-artifact.js'
)

describe('delete-artifact', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Set environment variables
    process.env.LOCAL_ACTION_ARTIFACT_PATH = '/tmp/artifacts'
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()

    // Unset environment variables
    delete process.env.LOCAL_ACTION_ARTIFACT_PATH
  })

  describe('deleteArtifactInternal', () => {
    it('Deletes an artifact', async () => {
      EnvMeta.artifacts = [{ name: 'artifact-name', id: 1, size: 0 }]

      const response =
        await deleteArtifact.deleteArtifactInternal('artifact-name')

      expect(fs.rmSync).toHaveBeenCalledTimes(1)
      expect(EnvMeta.artifacts.length).toBe(0)
      expect(response).toMatchObject({
        id: 1
      })
    })

    it('Deletes the latest artifact', async () => {
      EnvMeta.artifacts = [
        { name: 'artifact-name', id: 1, size: 0 },
        { name: 'artifact-name', id: 2, size: 0 }
      ]

      const response =
        await deleteArtifact.deleteArtifactInternal('artifact-name')

      expect(fs.rmSync).toHaveBeenCalledTimes(1)
      expect(EnvMeta.artifacts.length).toBe(1)
      expect(response).toMatchObject({
        id: 2
      })
    })

    it('Throws if no matching artifact is found', async () => {
      await expect(
        deleteArtifact.deleteArtifactInternal('artifact-name')
      ).rejects.toThrow()
    })
  })
})
