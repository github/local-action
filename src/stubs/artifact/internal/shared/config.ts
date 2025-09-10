/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/internal/shared/config.ts
 * Last Reviewed Date: 2025-09-10
 */

/**
 * Used for controlling the highWaterMark value of the zip that is being
 * streamed. The same value is used as the chunk size that is use during upload
 * to blob storage
 */
export function getUploadChunkSize(): number {
  return 8 * 1024 * 1024 // 8 MB Chunks
}

/**
 * Checks if the current environment is a GitHub Enterprise Server instance
 *
 * @returns True if running on GHES
 */
export function isGhes(): boolean {
  const ghUrl = new URL(process.env.GITHUB_SERVER_URL || 'https://github.com')

  const hostname = ghUrl.hostname.trimEnd().toUpperCase()
  const isGitHubHost = hostname === 'GITHUB.COM'
  const isGheHost = hostname.endsWith('.GHE.COM')
  const isLocalHost = hostname.endsWith('.LOCALHOST')

  return !isGitHubHost && !isGheHost && !isLocalHost
}

/**
 * Gets the GitHub workspace directory
 *
 * @remarks
 *
 * - Modified to use process.cwd() as a fallback
 *
 * @returns GitHub workspace directory
 */
export function getGitHubWorkspaceDir(): string {
  return process.env.GITHUB_WORKSPACE || process.cwd()
}
