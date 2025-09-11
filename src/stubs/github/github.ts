/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/github/src/github.ts
 * Last Reviewed Date: 2025-09-10
 *
 * @remarks
 *
 * - The `context` export is removed and defined in `commands/run.ts`. This is
 *   so that the context can be defined after the environment file is loaded.
 */

import type { OctokitOptions, OctokitPlugin } from '@octokit/core/types'
import { GitHub, getOctokitOptions } from './utils.js'

/**
 * Returns a hydrated octokit ready to use for GitHub Actions
 *
 * @param token Repo PAT or GITHUB_TOKEN
 * @param options Options to set
 * @returns An octokit instance
 */
export function getOctokit(
  token: string,
  options?: OctokitOptions,
  ...additionalPlugins: OctokitPlugin[]
): InstanceType<typeof GitHub> {
  const GitHubWithPlugins = GitHub.plugin(...additionalPlugins)

  return new GitHubWithPlugins(getOctokitOptions(token, options))
}
