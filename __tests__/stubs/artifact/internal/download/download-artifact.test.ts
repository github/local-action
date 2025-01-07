import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/core.js'
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
    // Reset all spies
    jest.resetAllMocks()

    // Unset environment variables
    delete process.env.LOCAL_ACTION_ARTIFACT_PATH
  })

  describe('downloadArtifactInternal', () => {
    it('Downloads an artifact', async () => {
      await downloadArtifact.downloadArtifactInternal(1)

      expect(fs.createReadStream).toHaveBeenCalledTimes(1)
      expect(stream.finished).toHaveBeenCalledTimes(1)
    })

    it('Throws if an artifact is not found', async () => {
      EnvMeta.artifacts = []

      await expect(
        downloadArtifact.downloadArtifactInternal(1)
      ).rejects.toThrow()
    })
  })
})
