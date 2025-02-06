import { jest } from '@jest/globals'
import * as utils from '../../../src/stubs/github/utils.js'

describe('github/utils', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getOctokitOptions', () => {
    it('Returns the options', () => {
      expect(utils.getOctokitOptions('test')).toEqual({
        auth: 'token test'
      })
    })
  })
})
