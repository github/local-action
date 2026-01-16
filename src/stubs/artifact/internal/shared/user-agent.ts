/**
 * Last Reviewed Commit: 4b6a4d80e13a01ecbf41e39098883d69cb54c0d3
 * Last Reviewed Date: 2026-01-16
 */

/**
 * Creates a user agent string for the GitHub client
 *
 * @returns User Agent
 */
export function getUserAgentString(): string {
  return `@github/local-action-${process.env.npm_package_version}`
}
