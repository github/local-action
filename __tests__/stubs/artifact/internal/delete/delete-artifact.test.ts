import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/@actions/core.js'
import * as github from '../../../../../__fixtures__/@actions/github.js'
import * as octokit from '../../../../../__fixtures__/@octokit/rest.js'
import * as fs from '../../../../../__fixtures__/fs.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../../src/stubs/env.js'

jest.unstable_mockModule('@octokit/rest', async () => {
  class Octokit {
    constructor() {
      return octokit
    }
  }

  return {
    Octokit
  }
})
jest.unstable_mockModule('fs', () => fs)

const getArtifactPublic =
  jest.fn<
    typeof import('../../../../../src/stubs/artifact/internal/find/get-artifact.js').getArtifactPublic
  >()

jest.unstable_mockModule(
  '../../../../../src/stubs/artifact/internal/find/get-artifact.js',
  () => ({
    getArtifactPublic
  })
)
jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)
jest.unstable_mockModule(
  '../../../../../src/stubs/github/github.js',
  () => github
)

const deleteArtifact = await import(
  '../../../../../src/stubs/artifact/internal/delete/delete-artifact.js'
)

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

describe('delete-artifact', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Set environment variables
    process.env.LOCAL_ACTION_ARTIFACT_PATH = '/tmp/artifacts'
  })

  afterEach(() => {
    jest.resetAllMocks()

    // Unset environment variables
    delete process.env.LOCAL_ACTION_ARTIFACT_PATH
  })

  describe('deleteArtifactPublic', () => {
    beforeEach(() => {
      getArtifactPublic.mockResolvedValue({
        artifact: {
          name: 'artifact-name',
          id: 1,
          size: 0
        }
      })
    })

    it('Deletes an artifact', async () => {
      mocktokit.rest.actions.deleteArtifact.mockResolvedValue({
        status: 204,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      const response = await deleteArtifact.deleteArtifactPublic(
        'artifact-name',
        1,
        'owner',
        'repo',
        'token'
      )

      expect(getArtifactPublic).toHaveBeenCalledTimes(1)
      expect(mocktokit.rest.actions.deleteArtifact).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        id: 1
      })
    })

    it('Throws if artifact fails to delete', async () => {
      mocktokit.rest.actions.deleteArtifact.mockResolvedValue({
        status: 400,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      await expect(
        deleteArtifact.deleteArtifactPublic(
          'artifact-name',
          1,
          'owner',
          'repo',
          'token'
        )
      ).rejects.toThrow('Invalid response from GitHub API: 400 (request-id)')
    })
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
