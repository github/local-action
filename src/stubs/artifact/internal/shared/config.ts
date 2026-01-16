/**
 * Last Reviewed Commit: 02afeb157764304bb3bfe1a6cfd37258ec3fcf7c
 * Last Reviewed Date: 2026-01-16
 *
 * @remarks
 *
 * - Removed getConcurrency
 * - Removed getUploadChunkTimeout
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

/**
 * This value can be changed with ACTIONS_ARTIFACT_MAX_ARTIFACT_COUNT variable.
 * Defaults to 1000 as a safeguard for rate limiting.
 */
export function getMaxArtifactListCount(): number {
  const maxCountVar = process.env.ACTIONS_ARTIFACT_MAX_ARTIFACT_COUNT || '1000'

  const maxCount = parseInt(maxCountVar)
  if (isNaN(maxCount) || maxCount < 1) {
    throw new Error(
      'Invalid value set for ACTIONS_ARTIFACT_MAX_ARTIFACT_COUNT env variable'
    )
  }

  return maxCount
}
