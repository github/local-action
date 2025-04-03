/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/github/src/internal/utils.ts
 */

import * as httpClient from '@actions/http-client'
import { type OctokitOptions } from '@octokit/core/types'
import * as http from 'http'
import { type ProxyAgent, fetch } from 'undici'

/**
 * Returns the auth string to use for the request.
 *
 * @param token Token
 * @param options Options
 * @returns Authentication string or undefined if no auth is provided
 */
export function getAuthString(
  token: string,
  options: OctokitOptions
): string | undefined {
  if (!token && !options.auth)
    throw new Error('Parameter token or opts.auth is required')
  else if (token && options.auth)
    throw new Error('Parameters token and opts.auth may not both be specified')

  return typeof options.auth === 'string' ? options.auth : `token ${token}`
}

/**
 * Returns the proxy agent to use for the request.
 *
 * @param destinationUrl Destination URL
 * @returns Proxy Agent
 */
export function getProxyAgent(destinationUrl: string): http.Agent {
  const hc = new httpClient.HttpClient()

  return hc.getAgent(destinationUrl)
}

/**
 * Returns the proxy agent dispatcher to use for the request.
 *
 * @param destinationUrl Destination URL
 * @returns Proxy agent or undefined if no proxy is provided
 */
export function getProxyAgentDispatcher(
  destinationUrl: string
): ProxyAgent | undefined {
  const hc = new httpClient.HttpClient()

  return hc.getAgentDispatcher(destinationUrl) as ProxyAgent | undefined
}

/**
 * Returns the fetch function to use for the request.
 *
 * @param destinationUrl Destination URL
 * @returns Fetch function
 */
/* istanbul ignore next */
export function getProxyFetch(destinationUrl: string): typeof fetch {
  const httpDispatcher = getProxyAgentDispatcher(destinationUrl)

  const proxyFetch: typeof fetch = async (url, opts) => {
    return fetch(url, {
      ...opts,
      dispatcher: httpDispatcher
    })
  }

  return proxyFetch
}

/**
 * Returns the base URL to use for the request.
 *
 * @returns Base URL
 */
export function getApiBaseUrl(): string {
  return process.env.GITHUB_API_URL || 'https://api.github.com'
}
