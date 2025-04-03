import { jest } from '@jest/globals'
import path from 'path'
import { ResetCoreMetadata } from '../../../src/stubs/core/core.js'
import {
  toPlatformPath,
  toPosixPath,
  toWin32Path
} from '../../../src/stubs/core/path-utils.js'
import { ResetEnvMetadata } from '../../../src/stubs/env.js'

// Prevent output during tests
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'table').mockImplementation(() => {})

describe('path-utils', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('toWin32Path()', () => {
    it('Returns a WIN32 path', () => {
      expect(toWin32Path('C:/Users/mona/Desktop')).toEqual(
        'C:\\Users\\mona\\Desktop'
      )
    })
  })

  describe('toPlatformPath()', () => {
    it('Returns a platform-specific path', () => {
      expect(toPlatformPath('C:/Users/mona/Desktop')).toEqual(
        `C:${path.sep}Users${path.sep}mona${path.sep}Desktop`
      )

      expect(toPosixPath('C:\\Users\\mona\\Desktop')).toEqual(
        `C:${path.sep}Users${path.sep}mona${path.sep}Desktop`
      )
    })
  })
})
