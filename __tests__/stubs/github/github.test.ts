import { jest } from '@jest/globals'
import * as github from '../../../src/stubs/github/github.js'
import { GitHub } from '../../../src/stubs/github/utils.js'

describe('github/github', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getOctokit', () => {
    it('Returns the options', () => {
      expect(github.getOctokit('test')).toBeInstanceOf(GitHub)
    })
  })
})
