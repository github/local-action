import { jest } from '@jest/globals'
import * as core from '../../../../__fixtures__/@actions/core.js'
import { ResetCoreMetadata } from '../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../src/stubs/env.js'

const isGhes = jest.fn().mockReturnValue(false)
const getGitHubWorkspaceDir = jest.fn().mockReturnValue('/github/workspace')
const getUploadChunkSize = jest.fn().mockReturnValue(8 * 1024 * 1024)
const uploadArtifact = jest.fn()
const downloadArtifactInternal = jest.fn()
const downloadArtifactPublic = jest.fn()
const listArtifactsInternal = jest.fn()
const listArtifactsPublic = jest.fn()
const getArtifactInternal = jest.fn()
const getArtifactPublic = jest.fn()
const deleteArtifactInternal = jest.fn()
const deleteArtifactPublic = jest.fn()

jest.unstable_mockModule(
  '../../../../src/stubs/artifact/internal/shared/config.js',
  () => ({
    isGhes,
    getGitHubWorkspaceDir,
    getUploadChunkSize
  })
)
jest.unstable_mockModule(
  '../../../../src/stubs/artifact/internal/upload/upload-artifact.js',
  () => ({
    uploadArtifact
  })
)
jest.unstable_mockModule(
  '../../../../src/stubs/artifact/internal/download/download-artifact.js',
  () => ({
    downloadArtifactPublic,
    downloadArtifactInternal
  })
)
jest.unstable_mockModule(
  '../../../../src/stubs/artifact/internal/find/list-artifacts.js',
  () => ({
    listArtifactsInternal,
    listArtifactsPublic
  })
)
jest.unstable_mockModule(
  '../../../../src/stubs/artifact/internal/find/get-artifact.js',
  () => ({
    getArtifactInternal,
    getArtifactPublic
  })
)
jest.unstable_mockModule(
  '../../../../src/stubs/artifact/internal/delete/delete-artifact.js',
  () => ({
    deleteArtifactInternal,
    deleteArtifactPublic
  })
)
jest.unstable_mockModule('../../../../src/stubs/core/core.js', () => core)

const { DefaultArtifactClient } = await import(
  '../../../../src/stubs/artifact/internal/client.js'
)

describe('DefaultArtifactClient', () => {
  beforeEach(() => {
    // Set environment variables
    process.env.LOCAL_ACTION_ARTIFACT_PATH = '/tmp/artifacts'

    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    EnvMeta.artifacts = [{ name: 'artifact-name', id: 1, size: 0 }]
  })

  afterEach(() => {
    jest.resetAllMocks()

    // Unset environment variables
    delete process.env.LOCAL_ACTION_ARTIFACT_PATH
  })

  describe('uploadArtifact', () => {
    it('Throws if LOCAL_ACTION_ARTIFACT_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_ARTIFACT_PATH

      const client = new DefaultArtifactClient()

      await expect(
        client.uploadArtifact('artifact-name', ['file1', 'file2'], 'root')
      ).rejects.toThrow()
    })

    it('Throws if running on GHES', async () => {
      isGhes.mockReturnValue(true)

      const client = new DefaultArtifactClient()

      await expect(
        client.uploadArtifact('artifact-name', ['file1', 'file2'], 'root')
      ).rejects.toThrow()
    })

    it('Uploads an artifact', async () => {
      const client = new DefaultArtifactClient()

      await client.uploadArtifact('artifact-name', ['file1', 'file2'], 'root')

      expect(uploadArtifact).toHaveBeenCalled()
    })
  })

  describe('downloadArtifact', () => {
    it('Throws if LOCAL_ACTION_ARTIFACT_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_ARTIFACT_PATH

      const client = new DefaultArtifactClient()

      await expect(client.downloadArtifact(1)).rejects.toThrow()
    })

    it('Throws if running on GHES', async () => {
      isGhes.mockReturnValue(true)

      const client = new DefaultArtifactClient()

      await expect(client.downloadArtifact(1)).rejects.toThrow()
    })

    it('Downloads an artifact (internal)', async () => {
      const client = new DefaultArtifactClient()

      await client.downloadArtifact(1)

      expect(downloadArtifactInternal).toHaveBeenCalled()
      expect(downloadArtifactPublic).not.toHaveBeenCalled()
    })

    it('Downloads an artifact (public)', async () => {
      const client = new DefaultArtifactClient()

      await client.downloadArtifact(1, {
        findBy: {
          repositoryOwner: 'owner',
          repositoryName: 'repo',
          workflowRunId: 1,
          token: 'token'
        }
      })

      expect(downloadArtifactInternal).not.toHaveBeenCalled()
      expect(downloadArtifactPublic).toHaveBeenCalled()
    })
  })

  describe('listArtifacts', () => {
    it('Throws if LOCAL_ACTION_ARTIFACT_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_ARTIFACT_PATH

      const client = new DefaultArtifactClient()

      await expect(client.listArtifacts()).rejects.toThrow()
    })

    it('Throws if running on GHES', async () => {
      isGhes.mockReturnValue(true)

      const client = new DefaultArtifactClient()

      await expect(client.listArtifacts()).rejects.toThrow()
    })

    it('Lists artifacts (internal)', async () => {
      const client = new DefaultArtifactClient()

      await client.listArtifacts()

      expect(listArtifactsInternal).toHaveBeenCalled()
      expect(listArtifactsPublic).not.toHaveBeenCalled()
    })

    it('Lists artifacts (public)', async () => {
      const client = new DefaultArtifactClient()

      await client.listArtifacts({
        findBy: {
          repositoryOwner: 'owner',
          repositoryName: 'repo',
          workflowRunId: 1,
          token: 'token'
        }
      })

      expect(listArtifactsInternal).not.toHaveBeenCalled()
      expect(listArtifactsPublic).toHaveBeenCalled()
    })
  })

  describe('getArtifact', () => {
    it('Throws if LOCAL_ACTION_ARTIFACT_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_ARTIFACT_PATH

      const client = new DefaultArtifactClient()

      await expect(client.getArtifact('artifact-name')).rejects.toThrow()
    })

    it('Throws if running on GHES', async () => {
      isGhes.mockReturnValue(true)

      const client = new DefaultArtifactClient()

      await expect(client.getArtifact('artifact-name')).rejects.toThrow()
    })

    it('Gets an artifact (internal)', async () => {
      const client = new DefaultArtifactClient()

      await client.getArtifact('artifact-name')

      expect(getArtifactInternal).toHaveBeenCalled()
      expect(getArtifactPublic).not.toHaveBeenCalled()
    })

    it('Gets an artifact (public)', async () => {
      const client = new DefaultArtifactClient()

      await client.getArtifact('artifact-name', {
        findBy: {
          repositoryOwner: 'owner',
          repositoryName: 'repo',
          workflowRunId: 1,
          token: 'token'
        }
      })

      expect(getArtifactInternal).not.toHaveBeenCalled()
      expect(getArtifactPublic).toHaveBeenCalled()
    })
  })

  describe('deleteArtifact', () => {
    it('Throws if LOCAL_ACTION_ARTIFACT_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_ARTIFACT_PATH

      const client = new DefaultArtifactClient()

      await expect(client.deleteArtifact('artifact-name')).rejects.toThrow()
    })

    it('Throws if running on GHES', async () => {
      isGhes.mockReturnValue(true)

      const client = new DefaultArtifactClient()

      await expect(client.deleteArtifact('artifact-name')).rejects.toThrow()
    })

    it('Deletes an artifact (internal)', async () => {
      const client = new DefaultArtifactClient()

      await client.deleteArtifact('artifact-name')

      expect(deleteArtifactInternal).toHaveBeenCalled()
      expect(deleteArtifactPublic).not.toHaveBeenCalled()
    })

    it('Deletes an artifact (public)', async () => {
      const client = new DefaultArtifactClient()

      await client.deleteArtifact('artifact-name', {
        findBy: {
          repositoryOwner: 'owner',
          repositoryName: 'repo',
          workflowRunId: 1,
          token: 'token'
        }
      })

      expect(deleteArtifactInternal).not.toHaveBeenCalled()
      expect(deleteArtifactPublic).toHaveBeenCalled()
    })
  })
})
