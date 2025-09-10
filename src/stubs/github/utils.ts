/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/github/src/utils.ts
 * Last Reviewed Date: 2025-09-10
 *
 * @remarks
 *
 * - The `context` export is removed and defined in `commands/run.ts`. This is
 *   so that the context can be defined after the environment file is loaded.
 */

import { Octokit } from '@octokit/core'
import type { OctokitOptions } from '@octokit/core/types'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import * as Utils from './internal/utils.js'

const baseUrl = Utils.getApiBaseUrl()

export const defaults: OctokitOptions = {
  baseUrl,
  request: {
    agent: Utils.getProxyAgent(baseUrl),
    fetch: Utils.getProxyFetch(baseUrl)
  }
}

export const GitHub = Octokit.plugin(
  restEndpointMethods,
  paginateRest
).defaults(defaults)

/**
 * Convenience function to correctly format Octokit Options to pass into the
 * constructor.
 *
 * @param token Repo PAT or GITHUB_TOKEN
 * @param options Options to set
 * @returns Octokit Options
 */
export function getOctokitOptions(
  token: string,
  options?: OctokitOptions
): OctokitOptions {
  // Shallow clone - don't mutate the object provided by the caller
  const opts = Object.assign({}, options || {})

  const auth = Utils.getAuthString(token, opts)
  if (auth) opts.auth = auth

  return opts
}
