import { jest } from '@jest/globals'
import * as exec from '../../../../__fixtures__/@actions/exec.js'
import * as io from '../../../../__fixtures__/@actions/io.js'
import * as fs from '../../../../__fixtures__/fs.js'

// Mock dependencies first
const mockGetGnuTarPathOnWindows = jest.fn() as jest.MockedFunction<any>

jest.unstable_mockModule('@actions/exec', () => exec)
jest.unstable_mockModule('@actions/io', () => io)
jest.unstable_mockModule('fs', () => fs)

jest.unstable_mockModule(
  '../../../../src/stubs/cache/internal/cacheUtils.js',
  () => ({
    getGnuTarPathOnWindows: mockGetGnuTarPathOnWindows,
    getCacheFileName: jest.fn().mockReturnValue('cache.tgz')
  })
)

// Import after mocking
const { CompressionMethod } = await import(
  '../../../../src/stubs/cache/internal/constants.js'
)
const { createTar, extractTar, listTar } = await import(
  '../../../../src/stubs/cache/internal/tar.js'
)

describe('cache/internal/tar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.LOCAL_ACTION_WORKSPACE = '/tmp/workspace'

    // Default mock values
    exec.exec.mockResolvedValue(0 as never)
    fs.existsSync.mockReturnValue(true)
    io.which.mockResolvedValue('/usr/bin/tar' as never)
    mockGetGnuTarPathOnWindows.mockResolvedValue('/usr/bin/tar')
    fs.writeFileSync.mockImplementation(() => {})
  })

  describe('listTar', () => {
    it('Lists tar contents with gzip compression', async () => {
      await listTar('/path/to/archive.tar.gz', CompressionMethod.Gzip)

      expect(exec.exec).toHaveBeenCalledWith(
        expect.stringContaining('tar'),
        undefined,
        expect.objectContaining({
          env: expect.any(Object)
        })
      )
    })
  })

  describe('extractTar', () => {
    it('Extracts tar with gzip compression', async () => {
      await extractTar('/path/to/archive.tar.gz', CompressionMethod.Gzip)

      expect(exec.exec).toHaveBeenCalledWith(
        expect.stringContaining('tar'),
        undefined,
        expect.objectContaining({
          env: expect.any(Object)
        })
      )
    })
  })

  describe('createTar', () => {
    it('Creates tar with gzip compression', async () => {
      const sourceDirectories = ['src/', 'dist/']
      await createTar(
        '/path/to/archive.tar.gz',
        sourceDirectories,
        CompressionMethod.Gzip
      )

      expect(fs.writeFileSync).toHaveBeenCalled()
      expect(exec.exec).toHaveBeenCalledWith(
        expect.stringContaining('tar'),
        undefined,
        expect.objectContaining({
          cwd: expect.any(String),
          env: expect.any(Object)
        })
      )
    })

    it('Creates tar with platform-specific args on macOS', async () => {
      // Mock the process.platform to be darwin to test the platform-specific code path
      const originalPlatform = Object.getOwnPropertyDescriptor(
        process,
        'platform'
      )
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true
      })

      // Mock gtar being available to trigger GNU tar type
      // The first call to which('gtar', false) should return the gtar path
      // The subsequent calls to which('tar', true) can return regular tar
      io.which.mockImplementation(((cmd: string) => {
        if (cmd === 'gtar') {
          return Promise.resolve('/usr/local/bin/gtar')
        }
        return Promise.resolve('/usr/bin/tar')
      }) as never)

      const sourceDirectories = ['src/']
      await createTar(
        '/path/to/archive.tar.gz',
        sourceDirectories,
        CompressionMethod.Gzip
      )

      expect(exec.exec).toHaveBeenCalledWith(
        expect.stringContaining('--delay-directory-restore'),
        undefined,
        expect.objectContaining({
          env: expect.any(Object)
        })
      )

      // Restore original platform
      if (originalPlatform)
        Object.defineProperty(process, 'platform', originalPlatform)
    })
  })
})
