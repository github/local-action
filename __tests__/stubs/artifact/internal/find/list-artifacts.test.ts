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

const listArtifacts = await import(
  '../../../../../src/stubs/artifact/internal/find/list-artifacts.js'
)

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

describe('list-artifacts', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('listArtifactsPublic', () => {
    it('Lists the artifacts', async () => {
      mocktokit.rest.actions.listWorkflowRunArtifacts.mockResolvedValue({
        data: {
          total_count: 1,
          artifacts: [
            {
              name: 'artifact-name',
              id: 1,
              size_in_bytes: 0,
              created_at: new Date().toISOString()
            }
          ]
        }
      } as any)

      const response = await listArtifacts.listArtifactsPublic(
        1,
        'owner',
        'repo',
        'token'
      )

      expect(
        mocktokit.rest.actions.listWorkflowRunArtifacts
      ).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        artifacts: [
          {
            name: 'artifact-name',
            id: 1,
            size: 0,
            createdAt: expect.any(Date)
          }
        ]
      })
    })

    it('Sets the date to undefined if created_at is not present', async () => {
      mocktokit.rest.actions.listWorkflowRunArtifacts.mockResolvedValue({
        data: {
          total_count: 1,
          artifacts: [
            {
              name: 'artifact-name',
              id: 1,
              size_in_bytes: 0
            }
          ]
        }
      } as any)

      const response = await listArtifacts.listArtifactsPublic(
        1,
        'owner',
        'repo',
        'token'
      )

      expect(
        mocktokit.rest.actions.listWorkflowRunArtifacts
      ).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        artifacts: [
          {
            name: 'artifact-name',
            id: 1,
            size: 0,
            createdAt: undefined
          }
        ]
      })
    })

    it('Returns the first 1000 artifacts', async () => {
      mocktokit.rest.actions.listWorkflowRunArtifacts.mockResolvedValue({
        data: {
          total_count: 1001,
          artifacts: [
            {
              name: 'artifact-name',
              id: 1,
              size_in_bytes: 0,
              created_at: new Date().toISOString()
            }
          ]
        }
      } as any)

      await listArtifacts.listArtifactsPublic(1, 'owner', 'repo', 'token')

      expect(mocktokit.rest.actions.listWorkflowRunArtifacts).toHaveBeenCalled()
      expect(core.warning).toHaveBeenCalledWith(
        'Workflow run 1 has more than 1000 artifacts. Results will be incomplete as only the first 1000 artifacts will be returned'
      )
    })

    it('Filters the latest artifacts', async () => {
      mocktokit.rest.actions.listWorkflowRunArtifacts.mockResolvedValue({
        data: {
          total_count: 3,
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
            },
            {
              name: 'artifact-name-2',
              id: 3,
              size_in_bytes: 0,
              created_at: new Date().toISOString()
            }
          ]
        }
      } as any)

      const response = await listArtifacts.listArtifactsPublic(
        1,
        'owner',
        'repo',
        'token',
        true
      )

      expect(
        mocktokit.rest.actions.listWorkflowRunArtifacts
      ).toHaveBeenCalledTimes(1)
      expect(response).toMatchObject({
        artifacts: [
          {
            name: 'artifact-name-2',
            id: 3,
            size: 0,
            createdAt: expect.any(Date)
          },
          {
            name: 'artifact-name',
            id: 2,
            size: 0,
            createdAt: expect.any(Date)
          }
        ]
      })
    })
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
