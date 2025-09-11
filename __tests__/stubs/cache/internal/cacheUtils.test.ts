import { jest } from '@jest/globals'
import * as io from '../../../../__fixtures__/@actions/io.js'
import * as fs from '../../../../__fixtures__/fs.js'

jest.unstable_mockModule('@actions/io', () => io)
jest.unstable_mockModule('fs', () => fs)

// Import after mocking
const {
  getCacheFileName,
  getCacheVersion,
  createTempDirectory,
  getArchiveFileSizeInBytes
} = await import('../../../../src/stubs/cache/internal/cacheUtils.js')
const { CacheFilename, CompressionMethod } = await import(
  '../../../../src/stubs/cache/internal/constants.js'
)

describe('cache/internal/cacheUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    process.env.LOCAL_ACTION_WORKSPACE = '/tmp/workspace'

    io.mkdirP.mockResolvedValue(undefined as never)
    fs.statSync.mockReturnValue({ size: 1024 })
  })

  describe('getCacheFileName', () => {
    it('Returns gzip filename for gzip compression', () => {
      const result = getCacheFileName(CompressionMethod.Gzip)

      expect(result).toBe(CacheFilename.Gzip)
    })

    it('Returns zstd filename for zstd compression', () => {
      const result = getCacheFileName(CompressionMethod.Zstd)

      expect(result).toBe(CacheFilename.Zstd)
    })

    it('Returns zstd filename for zstd without long compression', () => {
      const result = getCacheFileName(CompressionMethod.ZstdWithoutLong)

      expect(result).toBe(CacheFilename.Zstd)
    })
  })

  describe('getCacheVersion', () => {
    it('Generates cache version hash from paths', () => {
      const paths = ['src/', 'dist/']

      const result = getCacheVersion(paths)

      // Should be a 64-character hex string (SHA-256)
      expect(result).toMatch(/^[a-f0-9]{64}$/)
    })

    it('Includes compression method in cache version', () => {
      const paths = ['src/']

      const resultGzip = getCacheVersion(paths, CompressionMethod.Gzip)
      const resultZstd = getCacheVersion(paths, CompressionMethod.Zstd)

      expect(resultGzip).not.toBe(resultZstd)
    })

    it('Does not modify original paths array', () => {
      const paths = ['src/', 'dist/']
      const originalPaths = [...paths]

      getCacheVersion(paths)

      expect(paths).toEqual(originalPaths)
    })
  })

  describe('createTempDirectory', () => {
    beforeEach(() => {
      process.env.LOCAL_ACTION_WORKSPACE = '/tmp/workspace'
    })

    it('Creates a temporary directory', async () => {
      const tempDir = await createTempDirectory()

      expect(tempDir).toMatch(
        /^\/tmp\/workspace\/actions\/temp\/[a-f0-9-]{36}$/
      )
    })

    it('Creates unique directories on multiple calls', async () => {
      const tempDir1 = await createTempDirectory()
      const tempDir2 = await createTempDirectory()

      expect(tempDir1).not.toBe(tempDir2)
    })
  })

  describe('getArchiveFileSizeInBytes', () => {
    it('Returns the size of an archive file', () => {
      const filePath = '/path/to/archive.tar.gz'
      fs.statSync.mockReturnValue({ size: 2048 })

      const size = getArchiveFileSizeInBytes(filePath)

      expect(fs.statSync).toHaveBeenCalledWith(filePath)
      expect(size).toBe(2048)
    })
  })
})
