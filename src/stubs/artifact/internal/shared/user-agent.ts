/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/internal/shared/user-agent.ts
 */

/**
 * Creates a user agent string for the GitHub client
 *
 * @returns User Agent
 */
export function getUserAgentString(): string {
  return `@github/local-action-${process.env.npm_package_version}`
}
