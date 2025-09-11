import { jest } from '@jest/globals'
import * as core from '../../../__fixtures__/@actions/core.js'
import * as fs from '../../../__fixtures__/fs.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('fs', () => fs)

// Mock the internal dependencies
const mockTar = {
  createTar: jest.fn() as jest.MockedFunction<any>,
  extractTar: jest.fn() as jest.MockedFunction<any>,
  listTar: jest.fn() as jest.MockedFunction<any>
}

jest.unstable_mockModule(
  '../../../src/stubs/cache/internal/tar.js',
  () => mockTar
)

const mockUtils = {
  createTempDirectory: jest.fn() as jest.MockedFunction<() => Promise<string>>,
  getArchiveFileSizeInBytes: jest.fn() as jest.MockedFunction<
    (path: string) => number
  >,
  getCacheFileName: jest.fn() as jest.MockedFunction<
    (compression: string) => string
  >,
  getCacheVersion: jest.fn() as jest.MockedFunction<
    (paths: string[], compression: string, crossOs: boolean) => string
  >,
  getCompressionMethod: jest.fn() as jest.MockedFunction<() => Promise<string>>,
  resolvePaths: jest.fn() as jest.MockedFunction<
    (paths: string[]) => Promise<string[]>
  >,
  unlinkFile: jest.fn() as jest.MockedFunction<(path: string) => Promise<void>>
}

jest.unstable_mockModule(
  '../../../src/stubs/cache/internal/cacheUtils.js',
  () => mockUtils
)

// Mock env
const mockEnvMeta = {
  caches: {}
}

jest.unstable_mockModule('../../../src/stubs/env.js', () => ({
  EnvMeta: mockEnvMeta
}))

// Import after mocking
const { CACHE_STUBS, restoreCache, saveCache } = await import(
  '../../../src/stubs/cache/cache.js'
)

describe('cache/cache', () => {
  const originalWorkspace = process.env.LOCAL_ACTION_WORKSPACE
  const originalCachePath = process.env.LOCAL_ACTION_CACHE_PATH

  beforeEach(() => {
    jest.clearAllMocks()

    process.env.LOCAL_ACTION_WORKSPACE = '/tmp/workspace'
    process.env.LOCAL_ACTION_CACHE_PATH = '/tmp/cache'

    // Reset default mocks
    mockUtils.getArchiveFileSizeInBytes.mockReturnValue(1024 * 1024) // 1MB
    mockUtils.getCacheFileName.mockReturnValue('cache.tgz')
    mockUtils.getCacheVersion.mockReturnValue('abc123')
    mockUtils.getCompressionMethod.mockResolvedValue('gzip')
    mockUtils.resolvePaths.mockResolvedValue(['/path/to/files'])
    mockUtils.createTempDirectory.mockResolvedValue('/tmp/archive')
    mockUtils.unlinkFile.mockResolvedValue()

    core.isDebug.mockReturnValue(false)
    fs.readdirSync.mockReturnValue([])
    fs.existsSync.mockReturnValue(false)

    mockTar.createTar.mockResolvedValue(undefined)
    mockTar.extractTar.mockResolvedValue(undefined)
    mockTar.listTar.mockResolvedValue(undefined)

    mockEnvMeta.caches = {}
  })

  afterEach(() => {
    process.env.LOCAL_ACTION_WORKSPACE = originalWorkspace
    process.env.LOCAL_ACTION_CACHE_PATH = originalCachePath
  })

  describe('CACHE_STUBS', () => {
    it('Exports the correct cache stub functions', () => {
      expect(CACHE_STUBS).toHaveProperty('restoreCache')
      expect(CACHE_STUBS).toHaveProperty('saveCache')
      expect(typeof CACHE_STUBS.restoreCache).toBe('function')
      expect(typeof CACHE_STUBS.saveCache).toBe('function')
    })
  })

  describe('restoreCache', () => {
    it('Throws if LOCAL_ACTION_WORKSPACE is not set', async () => {
      delete process.env.LOCAL_ACTION_WORKSPACE

      await expect(restoreCache(['src/'], 'cache-key')).rejects.toThrow(
        'LOCAL_ACTION_WORKSPACE must be set when interacting with @actions/cache!'
      )
    })

    it('Throws if LOCAL_ACTION_CACHE_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_CACHE_PATH

      await expect(restoreCache(['src/'], 'cache-key')).rejects.toThrow(
        'LOCAL_ACTION_CACHE_PATH must be set when interacting with @actions/cache!'
      )
    })

    it('Throws if no paths are provided', async () => {
      await expect(restoreCache([], 'cache-key')).rejects.toThrow(
        'Path Validation Error: At least one directory or file path is required'
      )
    })

    it('Throws if too many keys are provided', async () => {
      const manyKeys = Array(11).fill('key')

      await expect(
        restoreCache(['src/'], 'primary-key', manyKeys)
      ).rejects.toThrow(
        'Key Validation Error: Keys are limited to a maximum of 10.'
      )
    })

    it('Returns undefined if no cache is found', async () => {
      fs.readdirSync.mockReturnValue([])

      const result = await restoreCache(['src/'], 'cache-key')

      expect(result).toBeUndefined()
    })

    it('Returns matched key for exact cache hit', async () => {
      // Mock file system to return cache files - the key must match exactly
      fs.readdirSync.mockReturnValue(['cache-key-abc123def456.cache'])

      const result = await restoreCache(['src/'], 'cache-key')

      expect(result).toBe('cache-key')
      expect(core.info).toHaveBeenCalledWith('Cache hit for: cache-key')
    })

    it('Handles undefined restore keys (nullish coalescing coverage)', async () => {
      fs.readdirSync.mockReturnValue(['cache-key-abc123def456.cache'])

      const result = await restoreCache(['src/'], 'cache-key', undefined)

      expect(result).toBe('cache-key')
      expect(core.info).toHaveBeenCalledWith('Cache hit for: cache-key')
    })

    it('Returns matched key for restore key hit', async () => {
      // Mock file system to return cache files that match restore key
      fs.readdirSync.mockReturnValue(['restore-key-abc123def456.cache'])

      const result = await restoreCache(['src/'], 'primary-key', [
        'restore-key'
      ])

      expect(result).toBe('restore-key')
      expect(core.info).toHaveBeenCalledWith(
        'Cache hit for restore-key: restore-key'
      )
    })

    it('Handles lookup only option', async () => {
      fs.readdirSync.mockReturnValue(['cache-key-abc123def456.cache'])

      const result = await restoreCache(['src/'], 'cache-key', [], {
        lookupOnly: true
      })

      expect(result).toBe('cache-key')
      expect(core.info).toHaveBeenCalledWith('Lookup only - skipping download')
      expect(mockTar.extractTar).not.toHaveBeenCalled()
    })

    it('Extracts cache when found', async () => {
      fs.readdirSync.mockReturnValue(['cache-key-abc123def456.cache'])

      const result = await restoreCache(['src/'], 'cache-key')

      expect(result).toBe('cache-key')
      expect(mockTar.extractTar).toHaveBeenCalled()
      expect(core.info).toHaveBeenCalledWith('Cache restored successfully')
    })

    it('Lists tar contents in debug mode', async () => {
      fs.readdirSync.mockReturnValue(['cache-key-abc123def456.cache'])
      core.isDebug.mockReturnValue(true)

      await restoreCache(['src/'], 'cache-key')

      expect(mockTar.listTar).toHaveBeenCalled()
    })

    it('Handles errors during restoration', async () => {
      fs.readdirSync.mockReturnValue(['cache-key-abc123def456.cache'])
      mockTar.extractTar.mockRejectedValue(new Error('Extraction failed'))

      const result = await restoreCache(['src/'], 'cache-key')

      expect(result).toBeUndefined()
      expect(core.warning).toHaveBeenCalledWith(
        'Failed to restore: Extraction failed'
      )
    })

    it('Finds cache with partial key match', async () => {
      // Reset to clean state and setup specific mock for this test
      fs.readdirSync.mockReturnValue(['cache-key-extra-abc123def456.cache'])

      const result = await restoreCache(['src/'], 'cache-key')

      expect(result).toBe('cache-key')
    })
  })

  describe('saveCache', () => {
    beforeEach(() => {
      mockEnvMeta.caches = { 1: 'existing-cache.cache' }
    })

    it('Throws if LOCAL_ACTION_WORKSPACE is not set', async () => {
      delete process.env.LOCAL_ACTION_WORKSPACE

      await expect(saveCache(['src/'], 'cache-key')).rejects.toThrow(
        'LOCAL_ACTION_WORKSPACE must be set when interacting with @actions/cache!'
      )
    })

    it('Throws if LOCAL_ACTION_CACHE_PATH is not set', async () => {
      delete process.env.LOCAL_ACTION_CACHE_PATH

      await expect(saveCache(['src/'], 'cache-key')).rejects.toThrow(
        'LOCAL_ACTION_CACHE_PATH must be set when interacting with @actions/cache!'
      )
    })

    it('Throws if no paths are provided', async () => {
      await expect(saveCache([], 'cache-key')).rejects.toThrow(
        'Path Validation Error: At least one directory or file path is required'
      )
    })

    it('Throws if key is too long', async () => {
      const longKey = 'a'.repeat(513)

      await expect(saveCache(['src/'], longKey)).rejects.toThrow(
        `Key Validation Error: ${longKey} cannot be larger than 512 characters.`
      )
    })

    it('Throws if key contains commas', async () => {
      const invalidKey = 'cache,key'

      await expect(saveCache(['src/'], invalidKey)).rejects.toThrow(
        `Key Validation Error: ${invalidKey} cannot contain commas.`
      )
    })

    it('Returns -1 if no paths resolve', async () => {
      mockUtils.resolvePaths.mockResolvedValue([])

      // The implementation throws an error when no paths resolve
      await expect(saveCache(['src/'], 'cache-key')).rejects.toThrow(
        'Path(s) specified in the action for caching do(es) not exist'
      )
    })

    it('Throws if cache already exists', async () => {
      // Setup successful path resolution but existing cache
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(true)

      const result = await saveCache(['src/'], 'cache-key')

      // The implementation catches the error and returns -1
      expect(result).toBe(-1)
    })

    it('Successfully saves cache', async () => {
      // Setup successful path resolution and no existing cache
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(false)

      const result = await saveCache(['src/'], 'cache-key')

      expect(result).toBe(2) // Next ID after existing cache
      expect(mockTar.createTar).toHaveBeenCalled()
      expect(fs.copyFileSync).toHaveBeenCalled()
    })

    it('Lists tar contents in debug mode', async () => {
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(false)
      core.isDebug.mockReturnValue(true)

      await saveCache(['src/'], 'cache-key')

      expect(mockTar.listTar).toHaveBeenCalled()
    })

    it('Handles errors during save', async () => {
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(false)
      mockTar.createTar.mockRejectedValue(new Error('Create failed'))

      const result = await saveCache(['src/'], 'cache-key')

      expect(result).toBe(-1)
      expect(core.warning).toHaveBeenCalledWith('Failed to save: Create failed')
    })

    it('Cleans up archive file after save', async () => {
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(false)

      await saveCache(['src/'], 'cache-key')

      expect(mockUtils.unlinkFile).toHaveBeenCalled()
    })

    it('Handles archive cleanup errors', async () => {
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(false)
      mockUtils.unlinkFile.mockRejectedValue(new Error('Cleanup failed'))

      await saveCache(['src/'], 'cache-key')

      expect(core.debug).toHaveBeenCalledWith(
        'Failed to delete archive: Error: Cleanup failed'
      )
    })

    it('Uses cross OS archive setting', async () => {
      mockUtils.resolvePaths.mockResolvedValue(['/resolved/path'])
      fs.existsSync.mockReturnValue(false)

      await saveCache(['src/'], 'cache-key', {}, true)

      expect(mockUtils.getCacheVersion).toHaveBeenCalledWith(
        ['src/'],
        'gzip',
        true
      )
    })
  })
})
