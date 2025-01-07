import { jest } from '@jest/globals'
import { getUserAgentString } from '../../../../../src/stubs/artifact/internal/shared/user-agent.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../../../../../src/stubs/env.js'

describe('user-agent', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  it('Outputs the correct user agent header', () => {
    expect(getUserAgentString()).toEqual(
      `@github/local-action-${process.env.npm_package_version}`
    )
  })
})
