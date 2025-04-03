import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/@actions/core.js'
import * as fs from '../../../../../__fixtures__/fs.js'

jest.unstable_mockModule('fs', () => fs)
jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)

const uploadZipSpecification = await import(
  '../../../../../src/stubs/artifact/internal/upload/upload-zip-specification.js'
)

describe('upload-zip-specification', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('validateRootDirectory', () => {
    it('Throws if the directory does not exist', () => {
      fs.existsSync.mockReturnValue(false)

      expect(() =>
        uploadZipSpecification.validateRootDirectory('/invalid/path')
      ).toThrow('The provided rootDirectory /invalid/path does not exist')
    })

    it('Throws if the path is not a directory', () => {
      fs.existsSync.mockReturnValue(true)
      fs.statSync.mockReturnValue({
        isDirectory: () => false
      })

      expect(() =>
        uploadZipSpecification.validateRootDirectory('/invalid/path')
      ).toThrow(
        'The provided rootDirectory /invalid/path is not a valid directory'
      )
    })

    it('Does not throw if the directory is valid', () => {
      fs.existsSync.mockReturnValue(true)
      fs.statSync.mockReturnValue({
        isDirectory: () => true
      })

      expect(() =>
        uploadZipSpecification.validateRootDirectory('/valid/path')
      ).not.toThrow()
    })
  })
})
