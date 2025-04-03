import { jest } from '@jest/globals'
import * as config from '../../../../../src/stubs/artifact/internal/shared/config.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../../../../../src/stubs/env.js'

describe('config', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()

    delete process.env.GITHUB_WORKSPACE
    delete process.env.GITHUB_SERVER_URL
  })

  describe('getUploadChunkSize', () => {
    it('Gets the upload chunk size', () => {
      expect(config.getUploadChunkSize()).toEqual(8 * 1024 * 1024) // 8 MB
    })
  })

  describe('isGhes', () => {
    it('Returns false if using GitHub.com', () => {
      process.env.GITHUB_SERVER_URL = 'https://github.com'

      expect(config.isGhes()).toBe(false)
    })

    it('Returns false if using GitHub.com (default value)', () => {
      expect(config.isGhes()).toBe(false)
    })

    it('Returns false if using GHE.com', () => {
      process.env.GITHUB_SERVER_URL = 'https://example.ghe.com'

      expect(config.isGhes()).toBe(false)
    })

    it('Returns false if using localhost', () => {
      process.env.GITHUB_SERVER_URL = 'https://example.localhost'

      expect(config.isGhes()).toBe(false)
    })

    it('Returns true if using a custom domain', () => {
      process.env.GITHUB_SERVER_URL = 'https://example.com'

      expect(config.isGhes()).toBe(true)
    })
  })

  describe('getGitHubWorkspaceDir', () => {
    it('Gets the workspace directory (default)', () => {
      expect(config.getGitHubWorkspaceDir()).toEqual(process.cwd())
    })

    it('Gets the workspace directory (env var)', () => {
      process.env.GITHUB_WORKSPACE = '/tmp/workspace'
      expect(config.getGitHubWorkspaceDir()).toEqual('/tmp/workspace')
    })
  })
})
