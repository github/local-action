import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/@actions/core.js'
import * as github from '../../../../../__fixtures__/@actions/github.js'
import * as octokit from '../../../../../__fixtures__/@octokit/rest.js'
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

jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)
jest.unstable_mockModule(
  '../../../../../src/stubs/github/github.js',
  () => github
)

const getArtifact = await import(
  '../../../../../src/stubs/artifact/internal/find/get-artifact.js'
)

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

describe('get-artifact', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getArtifactPublic', () => {
    it('Gets an artifact', async () => {
      mocktokit.request.mockResolvedValue({
        data: {
          artifacts: [
            {
              name: 'artifact-name',
              id: 1,
              size_in_bytes: 0,
              created_at: new Date().toISOString()
            }
          ]
        },
        status: 200,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      const response = await getArtifact.getArtifactPublic(
        'artifact-name',
        1,
        'owner',
        'repo',
        'token'
      )

      expect(mocktokit.request).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        artifact: {
          name: 'artifact-name',
          id: 1,
          size: 0,
          createdAt: expect.any(Date)
        }
      })
    })

    it('Throws if there is an API error', async () => {
      mocktokit.request.mockResolvedValue({
        status: 500,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      await expect(
        getArtifact.getArtifactPublic(
          'artifact-name',
          1,
          'owner',
          'repo',
          'token'
        )
      ).rejects.toThrow('Invalid response from GitHub API: 500 (request-id)')
    })

    it('Throws if no artifacts are found', async () => {
      mocktokit.request.mockResolvedValue({
        data: {
          artifacts: []
        },
        status: 200,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      await expect(
        getArtifact.getArtifactPublic(
          'artifact-name',
          1,
          'owner',
          'repo',
          'token'
        )
      ).rejects.toThrow()
    })

    it('Chooses the latest artifact if multiple are found', async () => {
      mocktokit.request.mockResolvedValue({
        data: {
          artifacts: [
            {
              name: 'artifact-name',
              id: 1,
              size_in_bytes: 0,
              created_at: new Date().toISOString()
            },
            {
              name: 'artifact-name',
              id: 2,
              size_in_bytes: 0,
              created_at: new Date().toISOString()
            }
          ]
        },
        status: 200,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      const response = await getArtifact.getArtifactPublic(
        'artifact-name',
        1,
        'owner',
        'repo',
        'token'
      )

      expect(mocktokit.request).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        artifact: {
          name: 'artifact-name',
          id: 2,
          size: 0,
          createdAt: expect.any(Date)
        }
      })
    })

    it('Returns an undefined date if there is no created_at', async () => {
      mocktokit.request.mockResolvedValue({
        data: {
          artifacts: [
            {
              name: 'artifact-name',
              id: 1,
              size_in_bytes: 0,
              created_at: undefined
            }
          ]
        },
        status: 200,
        headers: {
          'x-github-request-id': 'request-id'
        }
      } as any)

      const response = await getArtifact.getArtifactPublic(
        'artifact-name',
        1,
        'owner',
        'repo',
        'token'
      )

      expect(mocktokit.request).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        artifact: {
          name: 'artifact-name',
          id: 1,
          size: 0,
          createdAt: undefined
        }
      })
    })
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
