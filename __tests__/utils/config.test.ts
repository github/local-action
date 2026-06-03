import { jest } from '@jest/globals'
import * as path from '../../__fixtures__/path.js'
import { ResetCoreMetadata } from '../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env.js'

jest.unstable_mockModule('path', () => path)

const { getOSEntrypoints } = await import('../../src/utils/config.js')
const originalPlatform = process.platform

function withPlatform(platform: NodeJS.Platform, fn: () => void): void {
  Object.defineProperty(process, 'platform', { value: platform })

  try {
    fn()
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform })
  }
}

function expectedEntrypoint(
  entrypoint: string,
  actionType: 'esm' | 'cjs'
): string {
  if (process.platform !== 'win32') return entrypoint

  return actionType === 'esm' ? `/${entrypoint}` : entrypoint
}

describe('Config', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    path.resolve.mockImplementation(value => value)

    EnvMeta.entrypoint = 'action/entrypoint.ts'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getOSEntrypoints()', () => {
    it('Gets the ESM entrypoints', () => {
      EnvMeta.preEntrypoint = 'action/pre.ts'
      EnvMeta.postEntrypoint = 'action/post.ts'

      const result = getOSEntrypoints('esm')

      expect(result).toEqual({
        main: expectedEntrypoint('action/entrypoint.ts', 'esm'),
        pre: expectedEntrypoint('action/pre.ts', 'esm'),
        post: expectedEntrypoint('action/post.ts', 'esm')
      })
    })

    it('Gets the ESM entrypoints (undefined)', () => {
      EnvMeta.preEntrypoint = undefined
      EnvMeta.postEntrypoint = undefined

      const result = getOSEntrypoints('esm')

      expect(result).toEqual({
        main: expectedEntrypoint('action/entrypoint.ts', 'esm'),
        pre: undefined,
        post: undefined
      })
    })

    it('Gets the CJS entrypoints', () => {
      EnvMeta.preEntrypoint = 'action/pre.ts'
      EnvMeta.postEntrypoint = 'action/post.ts'

      const result = getOSEntrypoints('cjs')

      expect(result).toEqual({
        main: expectedEntrypoint('action/entrypoint.ts', 'cjs'),
        pre: expectedEntrypoint('action/pre.ts', 'cjs'),
        post: expectedEntrypoint('action/post.ts', 'cjs')
      })
    })

    it('Gets the CJS entrypoints (undefined)', () => {
      EnvMeta.preEntrypoint = undefined
      EnvMeta.postEntrypoint = undefined

      const result = getOSEntrypoints('cjs')

      expect(result).toEqual({
        main: expectedEntrypoint('action/entrypoint.ts', 'cjs'),
        pre: undefined,
        post: undefined
      })
    })

    it('Gets entrypoints on non-Windows', () => {
      withPlatform('linux', () => {
        EnvMeta.preEntrypoint = 'action/pre.ts'
        EnvMeta.postEntrypoint = 'action/post.ts'

        const result = getOSEntrypoints('esm')

        expect(result).toEqual({
          main: 'action/entrypoint.ts',
          pre: 'action/pre.ts',
          post: 'action/post.ts'
        })
      })
    })
  })
})
