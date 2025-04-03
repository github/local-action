import { jest } from '@jest/globals'
import { type Stats } from 'fs'
import * as core from '../../../../../__fixtures__/@actions/core.js'
import * as crypto from '../../../../../__fixtures__/crypto.js'
import * as fs from '../../../../../__fixtures__/fs.js'
import * as stream from '../../../../../__fixtures__/stream/promises.js'
import { ResetCoreMetadata } from '../../../../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../../../../src/stubs/env.js'

const validateArtifactName = jest.fn()
const validateRootDirectory = jest.fn()
const getUploadZipSpecification = jest.fn()
const createZipUploadStream = jest.fn()
const zipUploadStream = {
  on: () => zipUploadStream,
  pipe: () => zipUploadStream,
  setEncoding: () => zipUploadStream
}
const hashStream = {
  end: () => hashStream,
  read: () => hashStream
}
const writeStream = {
  on: () => writeStream
}

jest.unstable_mockModule('crypto', () => crypto)
jest.unstable_mockModule('fs', () => fs)
jest.unstable_mockModule('stream/promises', () => stream)
jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)
jest.unstable_mockModule(
  '../../../../../src/stubs/artifact/internal/upload/upload-zip-specification.js',
  () => ({
    validateRootDirectory,
    getUploadZipSpecification
  })
)
jest.unstable_mockModule(
  '../../../../../src/stubs/artifact/internal/upload/path-and-artifact-name-validation.js',
  () => ({
    validateArtifactName
  })
)
jest.unstable_mockModule(
  '../../../../../src/stubs/artifact/internal/upload/zip.js',
  () => ({
    createZipUploadStream
  })
)

const uploadArtifact = await import(
  '../../../../../src/stubs/artifact/internal/upload/upload-artifact.js'
)

describe('upload-artifacts', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.LOCAL_ACTION_ARTIFACT_PATH = '/tmp/artifacts'

    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Reset mocks
    getUploadZipSpecification.mockImplementation(() => [
      {
        sourcePath: 'source-path',
        destinationPath: 'destination-path',
        stats: {} as Stats
      }
    ])
    createZipUploadStream.mockImplementation(() => zipUploadStream)
    crypto.createHash.mockImplementation(() => hashStream)
    fs.createWriteStream.mockImplementation(() => writeStream)
  })

  afterEach(() => {
    jest.resetAllMocks()

    // Unset environment variables
    delete process.env.LOCAL_ACTION_ARTIFACT_PATH
  })

  describe('uploadArtifact', () => {
    it('Uploads an artifact', async () => {
      await uploadArtifact.uploadArtifact(
        'artifact-name',
        ['file1', 'file2'],
        'root'
      )

      expect(getUploadZipSpecification).toHaveBeenCalledTimes(1)
      expect(createZipUploadStream).toHaveBeenCalledTimes(1)
      expect(fs.createWriteStream).toHaveBeenCalledTimes(1)
      expect(crypto.createHash).toHaveBeenCalledTimes(1)
      expect(stream.finished).toHaveBeenCalledTimes(1)
    })

    it('Throws if no files are included in the artifact', async () => {
      getUploadZipSpecification.mockImplementation(() => [])

      await expect(
        uploadArtifact.uploadArtifact('artifact-name', [], 'root')
      ).rejects.toThrow()
    })

    it('Throws if an artifact exists with the same name', async () => {
      EnvMeta.artifacts = [{ name: 'artifact-name', id: 1, size: 0 }]

      await expect(
        uploadArtifact.uploadArtifact('artifact-name', ['file'], 'root')
      ).rejects.toThrow()
    })

    it('Throws if more than 10 artifacts are created', async () => {
      EnvMeta.artifacts = Array.from({ length: 10 }, (_, i) => ({
        name: `artifact-${i}`,
        id: i + 1,
        size: 0
      }))

      await expect(
        uploadArtifact.uploadArtifact('new-artifact', ['file'], 'root')
      ).rejects.toThrow()
    })
  })
})
