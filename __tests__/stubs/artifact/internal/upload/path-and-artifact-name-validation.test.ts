import { jest } from '@jest/globals'
import * as core from '../../../../../__fixtures__/@actions/core.js'

jest.unstable_mockModule('../../../../../src/stubs/core/core.js', () => core)

const pathAndArtifactNameValidation = await import(
  '../../../../../src/stubs/artifact/internal/upload/path-and-artifact-name-validation.js'
)

describe('path-and-artifact-name-validation', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('validateArtifactName', () => {
    it('Throws if no name is provided', () => {
      expect(() =>
        pathAndArtifactNameValidation.validateArtifactName('')
      ).toThrow('Provided artifact name input during validation is empty')
    })

    it('Throws if name contains invalid characters', () => {
      expect(() =>
        pathAndArtifactNameValidation.validateArtifactName('invalid<name')
      ).toThrow()
    })

    it('Does not throw if name is valid', () => {
      expect(() =>
        pathAndArtifactNameValidation.validateArtifactName('valid-name')
      ).not.toThrow()
    })
  })

  describe('validateFilePath', () => {
    it('Throws if no path is provided', () => {
      expect(() => pathAndArtifactNameValidation.validateFilePath('')).toThrow(
        'Provided file path input during validation is empty'
      )
    })

    it('Throws if path contains invalid characters', () => {
      expect(() =>
        pathAndArtifactNameValidation.validateFilePath('invalid<path')
      ).toThrow()
    })

    it('Does not throw if path is valid', () => {
      expect(() =>
        pathAndArtifactNameValidation.validateFilePath('valid/path')
      ).not.toThrow()
    })
  })
})
