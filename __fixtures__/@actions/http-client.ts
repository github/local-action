import { jest } from '@jest/globals'

export const getAgent = jest.fn()
export const getAgentDispatcher = jest.fn()

export class HttpClient {
  getAgent = getAgent
  getAgentDispatcher = getAgentDispatcher
}
