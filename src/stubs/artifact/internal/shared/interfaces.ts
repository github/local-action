/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/internal/shared/interfaces.ts
 * Last Reviewed Date: 2025-09-10
 */

/**
 * Options for downloading an artifact
 *
 * @remarks
 *
 * - Removed expectedHash as it is not required when managing artifacts locally
 */
export interface DownloadArtifactOptions {
  path?: string
}

/**
 * Response from the server when downloading an artifact
 *
 * @remarks
 *
 * - Removed digestMismatch as it is not required when managing artifacts
 *   locally
 */
export interface DownloadArtifactResponse {
  downloadPath?: string
}

/**
 * Response from the server when an artifact is uploaded
 */
export interface UploadArtifactResponse {
  size?: number
  id?: number
  digest?: string
}

/**
 * Options for uploading an artifact
 */
export interface UploadArtifactOptions {
  retentionDays?: number
  compressionLevel?: number
}

/**
 * Response from the server when getting an artifact
 */
export interface GetArtifactResponse {
  artifact: Artifact
}

/**
 * Options for listing artifacts
 */
export interface ListArtifactsOptions {
  latest?: boolean
}

/**
 * Response from the server when listing artifacts
 */
export interface ListArtifactsResponse {
  artifacts: Artifact[]
}

/**
 * Response from the server when downloading an artifact
 *
 * @remarks
 *
 * - Removed digestMismatch as it is not required when managing artifacts
 *   locally
 */
export interface DownloadArtifactResponse {
  downloadPath?: string
}

/**
 * Options for downloading an artifact
 *
 * @remarks
 *
 * - Removed expectedHash as it is not required when managing artifacts locally
 */
export interface DownloadArtifactOptions {
  path?: string
}

/**
 * An Actions Artifact
 *
 * @remarks
 *
 * - Removed digest as it is not required when managing artifacts locally
 */
export interface Artifact {
  name: string
  id: number
  size: number
  createdAt?: Date
}

/**
 * FindOptions are for fetching Artifact(s) out of the scope of the current run.
 */
export interface FindOptions {
  findBy?: {
    token: string
    workflowRunId: number
    repositoryOwner: string
    repositoryName: string
  }
}

/**
 * Response from the server when deleting an artifact
 */
export interface DeleteArtifactResponse {
  id: number
}
