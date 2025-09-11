import {
  ArchiveToolType,
  CacheFilename,
  CacheFileSizeLimit,
  CompressionMethod,
  DefaultRetryAttempts,
  DefaultRetryDelay,
  GnuTarPathOnWindows,
  ManifestFilename,
  SocketTimeout,
  SystemTarPathOnWindows,
  TarFilename
} from '../../../../src/stubs/cache/internal/constants.js'

describe('cache/internal/constants', () => {
  describe('CacheFilename', () => {
    it('Has the correct values', () => {
      expect(CacheFilename.Gzip).toBe('cache.tgz')
      expect(CacheFilename.Zstd).toBe('cache.tzst')
    })
  })

  describe('CompressionMethod', () => {
    it('Has the correct values', () => {
      expect(CompressionMethod.Gzip).toBe('gzip')
      expect(CompressionMethod.ZstdWithoutLong).toBe('zstd-without-long')
      expect(CompressionMethod.Zstd).toBe('zstd')
    })
  })

  describe('ArchiveToolType', () => {
    it('Has the correct values', () => {
      expect(ArchiveToolType.GNU).toBe('gnu')
      expect(ArchiveToolType.BSD).toBe('bsd')
    })
  })

  describe('Default values', () => {
    it('Has the correct default retry attempts', () => {
      expect(DefaultRetryAttempts).toBe(2)
    })

    it('Has the correct default retry delay', () => {
      expect(DefaultRetryDelay).toBe(5000)
    })

    it('Has the correct socket timeout', () => {
      expect(SocketTimeout).toBe(5000)
    })
  })

  describe('Windows tar paths', () => {
    it('Has the correct GNU tar path', () => {
      expect(GnuTarPathOnWindows).toBe(
        `${process.env['PROGRAMFILES']}\\Git\\usr\\bin\\tar.exe`
      )
    })

    it('Has the correct system tar path', () => {
      expect(SystemTarPathOnWindows).toBe(
        `${process.env['SYSTEMDRIVE']}\\Windows\\System32\\tar.exe`
      )
    })
  })

  describe('File names', () => {
    it('Has the correct tar filename', () => {
      expect(TarFilename).toBe('cache.tar')
    })

    it('Has the correct manifest filename', () => {
      expect(ManifestFilename).toBe('manifest.txt')
    })
  })

  describe('Cache file size limit', () => {
    it('Has the correct size limit (10GiB)', () => {
      expect(CacheFileSizeLimit).toBe(10 * Math.pow(1024, 3))
    })
  })
})
