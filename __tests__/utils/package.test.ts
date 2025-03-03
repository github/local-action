import { jest } from '@jest/globals'
import * as fs from '../../__fixtures__/fs.js'
import { ResetCoreMetadata } from '../../src/stubs/core/core.js'
import { ResetEnvMetadata } from '../../src/stubs/env.js'

jest.unstable_mockModule('fs', () => fs)

const { isESM } = await import('../../src/utils/package.js')

describe('Package', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('isESM', () => {
    it('Returns true for ESM packages', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          type: 'module'
        })
      )

      expect(isESM()).toBe(true)
    })
  })
})
