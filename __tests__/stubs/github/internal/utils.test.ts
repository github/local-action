import { jest } from '@jest/globals'
import * as httpClient from '../../../../__fixtures__/@actions/http-client.js'

jest.unstable_mockModule('@actions/http-client', () => httpClient)

const utils = await import('../../../../src/stubs/github/internal/utils.js')

const destinationUrl = 'http://example.com'
const expectedProxyAgent = {}
const expectedProxyAgentDispatcher = {}

describe('github/internal/utils', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getAuthString', () => {
    it('Throws if both inputs are missing', () => {
      expect(() => utils.getAuthString('', {})).toThrow(
        'Parameter token or opts.auth is required'
      )
    })

    it('Throws if both inputs are present', () => {
      expect(() => utils.getAuthString('TOKEN', { auth: 'TOKEN' })).toThrow(
        'Parameters token and opts.auth may not both be specified'
      )
    })

    it('Returns the options.auth value', () => {
      expect(utils.getAuthString('', { auth: 'TOKEN' })).toBe('TOKEN')
    })

    it('Returns the token value', () => {
      expect(utils.getAuthString('TOKEN', {})).toBe('token TOKEN')
    })
  })

  describe('getProxyAgent', () => {
    it('Returns the proxy agent', () => {
      httpClient.getAgent.mockReturnValue(expectedProxyAgent)

      const result = utils.getProxyAgent(destinationUrl)

      expect(result).toBe(expectedProxyAgent)
      expect(httpClient.getAgent).toHaveBeenCalledWith(destinationUrl)
    })

    it('Returns undefined if no proxy agent is provided', () => {
      httpClient.getAgent.mockReturnValue(undefined)

      const result = utils.getProxyAgent(destinationUrl)

      expect(result).toBeUndefined()
      expect(httpClient.getAgent).toHaveBeenCalledWith(destinationUrl)
    })
  })

  describe('getProxyAgentDispatcher', () => {
    it('Returns the proxy agent dispatcher', () => {
      httpClient.getAgentDispatcher.mockReturnValue(
        expectedProxyAgentDispatcher
      )

      const result = utils.getProxyAgentDispatcher(destinationUrl)

      expect(result).toBe(expectedProxyAgentDispatcher)
      expect(httpClient.getAgentDispatcher).toHaveBeenCalledWith(destinationUrl)
    })

    it('Returns undefined if no proxy agent is provided', () => {
      httpClient.getAgentDispatcher.mockReturnValue(undefined)

      const result = utils.getProxyAgentDispatcher(destinationUrl)

      expect(result).toBeUndefined()
      expect(httpClient.getAgentDispatcher).toHaveBeenCalledWith(destinationUrl)
    })
  })

  describe('getApiBaseUrl', () => {
    it('Returns the base URL', () => {
      delete process.env.GITHUB_API_URL

      const result = utils.getApiBaseUrl()

      expect(result).toBe('https://api.github.com')
    })

    it('Returns the base URL from the environment variable', () => {
      process.env.GITHUB_API_URL = 'https://example.com'

      const result = utils.getApiBaseUrl()

      expect(result).toBe('https://example.com')
    })
  })
})
