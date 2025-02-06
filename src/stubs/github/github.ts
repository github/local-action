/**
 * @github/local-action Modified
 */

import { OctokitOptions, OctokitPlugin } from '@octokit/core/types'
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
