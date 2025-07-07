import { jest } from '@jest/globals'
import * as path from '../../__fixtures__/path.js'
import { ResetCoreMetadata } from '../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env.js'

jest.unstable_mockModule('path', () => path)

const { getOSEntrypoints } = await import('../../src/utils/config.js')

describe('Config', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    path.resolve.mockImplementation(value => value)

    EnvMeta.entrypoint = '/action/entrypoint.ts'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getOSEntrypoints()', () => {
    it('Gets the ESM entrypoints', () => {
      EnvMeta.preEntrypoint = '/action/pre.ts'
      EnvMeta.postEntrypoint = '/action/post.ts'

      const result = getOSEntrypoints('esm')

      expect(result).toEqual({
        main: '/action/entrypoint.ts',
        pre: '/action/pre.ts',
        post: '/action/post.ts'
      })
    })

    it('Gets the ESM entrypoints (undefined)', () => {
      EnvMeta.preEntrypoint = undefined
      EnvMeta.postEntrypoint = undefined

      const result = getOSEntrypoints('esm')

      expect(result).toEqual({
        main: '/action/entrypoint.ts',
        pre: undefined,
        post: undefined
      })
    })

    it('Gets the CJS entrypoints', () => {
      EnvMeta.preEntrypoint = '/action/pre.ts'
      EnvMeta.postEntrypoint = '/action/post.ts'

      const result = getOSEntrypoints('cjs')

      expect(result).toEqual({
        main: '/action/entrypoint.ts',
        pre: '/action/pre.ts',
        post: '/action/post.ts'
      })
    })

    it('Gets the CJS entrypoints (undefined)', () => {
      EnvMeta.preEntrypoint = undefined
      EnvMeta.postEntrypoint = undefined

      const result = getOSEntrypoints('cjs')

      expect(result).toEqual({
        main: '/action/entrypoint.ts',
        pre: undefined,
        post: undefined
      })
    })
  })
})
