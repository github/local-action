/**
 * Last Reviewed Commit: 94de2cf6d446e4afd3d7b66408e7c513633dddaa
 * Last Reviewed Date: 2026-01-16
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
