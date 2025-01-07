/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
export function getUploadChunkSize(): number {
  return 8 * 1024 * 1024 // 8 MB Chunks
}

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
export function isGhes(): boolean {
  const ghUrl = new URL(
    process.env['GITHUB_SERVER_URL'] || 'https://github.com'
  )

  const hostname = ghUrl.hostname.trimEnd().toUpperCase()
  const isGitHubHost = hostname === 'GITHUB.COM'
  const isGheHost = hostname.endsWith('.GHE.COM')
  const isLocalHost = hostname.endsWith('.LOCALHOST')

  return !isGitHubHost && !isGheHost && !isLocalHost
}

/**
 * @github/local-action Modified
 */
export function getGitHubWorkspaceDir(): string {
  // Default to current working directory
  /* istanbul ignore next */
  return process.env['GITHUB_WORKSPACE'] || process.cwd()
}
