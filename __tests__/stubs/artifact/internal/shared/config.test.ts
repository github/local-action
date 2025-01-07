import { jest } from '@jest/globals'
import { getGitHubWorkspaceDir } from '../../../../../src/stubs/artifact/internal/shared/config.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../../../../../src/stubs/env.js'

describe('config', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()

    delete process.env.GITHUB_WORKSPACE
  })

  it('Gets the workspace directory (default)', () => {
    expect(getGitHubWorkspaceDir()).toEqual(process.cwd())
  })

  it('Gets the workspace directory (env var)', () => {
    process.env.GITHUB_WORKSPACE = '/tmp/workspace'
    expect(getGitHubWorkspaceDir()).toEqual('/tmp/workspace')
  })
})
