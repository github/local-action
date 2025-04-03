import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/@actions/core.js'
import * as crypto from '../../../../../__fixtures__/crypto.js'
import * as fs from '../../../../../__fixtures__/fs.js'
import * as stream from '../../../../../__fixtures__/stream/promises.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../../src/stubs/env.js'

const readStream = {
  on: () => readStream,
  pipe: () => readStream
}

jest.unstable_mockModule('crypto', () => crypto)
jest.unstable_mockModule('fs', () => fs)
jest.unstable_mockModule('stream/promises', () => stream)

jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)

const downloadArtifact = await import(
  '../../../../../src/stubs/artifact/internal/download/download-artifact.js'
)

describe('download-artifact', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.LOCAL_ACTION_ARTIFACT_PATH = '/tmp/artifacts'

    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Reset mocks
    fs.createReadStream.mockImplementation(() => readStream)

    EnvMeta.artifacts = [{ name: 'artifact-name', id: 1, size: 0 }]
  })

  afterEach(() => {
    jest.resetAllMocks()

    // Unset environment variables
    delete process.env.LOCAL_ACTION_ARTIFACT_PATH
  })

  describe('scrubQueryParameters', () => {
    it('Scrubs query parameters from a URL', () => {
      const url = 'https://example.com?foo=bar&baz=qux'
      const scrubbedUrl = downloadArtifact.scrubQueryParameters(url)
      expect(scrubbedUrl).toBe('https://example.com/')
    })
  })

  describe('exists', () => {
    it('Returns true if the path exists', () => {
      fs.accessSync.mockReturnValue(undefined)
      const result = downloadArtifact.exists('/tmp/artifacts')
      expect(result).toBe(true)
    })

    it('Returns false if the path does not exist', () => {
      fs.accessSync.mockImplementation(() => {
        throw { code: 'ENOENT' }
      })
      const result = downloadArtifact.exists('/tmp/artifacts')
      expect(result).toBe(false)
    })

    it('Throws if an error other than ENOENT occurs', () => {
      fs.accessSync.mockReset().mockImplementation(() => {
        throw { code: 'EPERM' }
      })
      expect(() => downloadArtifact.exists('/tmp/artifacts')).toThrow()
    })
  })

  describe('downloadArtifactInternal', () => {
    it('Downloads an artifact', async () => {
      await downloadArtifact.downloadArtifactInternal(1)

      expect(fs.createReadStream).toHaveBeenCalledTimes(1)
      expect(stream.finished).toHaveBeenCalledTimes(1)
    })

    it('Downloads the first artifact if multiple are found', async () => {
      EnvMeta.artifacts = [
        { name: 'artifact-name-1', id: 1, size: 0 },
        { name: 'artifact-name-2', id: 1, size: 0 }
      ]

      await downloadArtifact.downloadArtifactInternal(1)

      expect(fs.createReadStream).toHaveBeenCalledTimes(1)
      expect(fs.createReadStream).toHaveBeenCalledWith(
        '/tmp/artifacts/artifact-name-1.zip'
      )
      expect(stream.finished).toHaveBeenCalledTimes(1)
    })

    it('Throws if an artifact is not found', async () => {
      EnvMeta.artifacts = []

      await expect(
        downloadArtifact.downloadArtifactInternal(1)
      ).rejects.toThrow()
    })

    it('Throws if an error occurs while downloading', async () => {
      fs.createReadStream.mockImplementation(() => {
        throw new Error('Download error')
      })

      await expect(
        downloadArtifact.downloadArtifactInternal(1)
      ).rejects.toThrow(
        'Unable to download and extract artifact: Download error'
      )
    })
  })
})
