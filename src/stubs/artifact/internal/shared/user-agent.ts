/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/internal/shared/user-agent.ts
 * Last Reviewed Date: 2025-09-10
 */

/**
 * Creates a user agent string for the GitHub client
 *
 * @returns User Agent
 */
export function getUserAgentString(): string {
  return `@github/local-action-${process.env.npm_package_version}`
}
