import { jest } from '@jest/globals'
import * as errors from '../../../../../src/stubs/artifact/internal/shared/errors.js'

describe('errors', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('FilesNotFoundError', () => {
    it('Returns a default message', () => {
      const error = new errors.FilesNotFoundError()

      expect(error.message).toEqual('No files were found to upload')
    })

    it('Returns a list of files', () => {
      const error = new errors.FilesNotFoundError(['file1', 'file2'])

      expect(error.message).toEqual(
        'No files were found to upload: file1, file2'
      )
    })
  })

  describe('ArtifactNotFoundError', () => {
    it('Returns a default message', () => {
      const error = new errors.ArtifactNotFoundError()

      expect(error.message).toEqual('Artifact not found')
    })

    it('Returns a custom message', () => {
      const error = new errors.ArtifactNotFoundError('Custom message')

      expect(error.message).toEqual('Custom message')
    })
  })
})
