import { jest } from '@jest/globals'
import * as retry from '../../../../../src/stubs/artifact/internal/find/retry-options.js'

describe('retry-options', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getRetryOptions', () => {
    it('Gets the retry options', async () => {
      const [retryOptions, requestOptions] = retry.getRetryOptions(
        {} as any,
        5,
        [400, 401, 403, 404, 422]
      )

      expect(retryOptions).toEqual({
        enabled: true,
        doNotRetry: [400, 401, 403, 404, 422]
      })
      expect(requestOptions).toEqual({
        retries: 5
      })
    })

    it('Disables retries', async () => {
      const [retryOptions, requestOptions] = retry.getRetryOptions(
        {} as any,
        0,
        [400, 401, 403, 404, 422]
      )

      expect(retryOptions).toEqual({
        enabled: false
      })
      expect(requestOptions).toBeUndefined()
    })

    it('Uses default exempt status codes', async () => {
      const [retryOptions, requestOptions] = retry.getRetryOptions(
        {} as any,
        5,
        []
      )

      expect(retryOptions).toEqual({
        enabled: true
      })
      expect(requestOptions).toEqual({
        retries: 5
      })
    })
  })
})
