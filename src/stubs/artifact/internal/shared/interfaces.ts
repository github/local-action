/**
 * @github/local-action Unmodified
 */
export interface DownloadArtifactOptions {
  path?: string
}

/**
 * @github/local-action Unmodified
 */
export interface DownloadArtifactResponse {
  downloadPath?: string
}

/**
 * @github/local-action Unmodified
 */
export interface UploadArtifactResponse {
  size?: number
  id?: number
  digest?: string
}

/**
 * @github/local-action Unmodified
 */
export interface UploadArtifactOptions {
  retentionDays?: number
  compressionLevel?: number
}

/**
 * @github/local-action Unmodified
 */
export interface GetArtifactResponse {
  artifact: Artifact
}

/**
 * @github/local-action Unmodified
 */
export interface ListArtifactsOptions {
  latest?: boolean
}

/**
 * @github/local-action Unmodified
 */
export interface ListArtifactsResponse {
  artifacts: Artifact[]
}

/**
 * @github/local-action Unmodified
 */
export interface DownloadArtifactResponse {
  downloadPath?: string
}

/**
 * @github/local-action Unmodified
 */
export interface DownloadArtifactOptions {
  path?: string
}

/**
 * @github/local-action Unmodified
 */
export interface Artifact {
  name: string
  id: number
  size: number
  createdAt?: Date
}

/**
 * @github/local-action Unmodified
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
 * @github/local-action Unmodified
 */
export interface DeleteArtifactResponse {
  id: number
}
