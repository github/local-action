/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/internal/client.ts
 */

import { warning } from '../../core/core.js'
import {
  deleteArtifactInternal,
  deleteArtifactPublic
} from './delete/delete-artifact.js'
import {
  downloadArtifactInternal,
  downloadArtifactPublic
} from './download/download-artifact.js'
import { getArtifactInternal, getArtifactPublic } from './find/get-artifact.js'
import {
  listArtifactsInternal,
  listArtifactsPublic
} from './find/list-artifacts.js'
import { isGhes } from './shared/config.js'
import { GHESNotSupportedError } from './shared/errors.js'
import type {
  DeleteArtifactResponse,
  DownloadArtifactOptions,
  DownloadArtifactResponse,
  FindOptions,
  GetArtifactResponse,
  ListArtifactsOptions,
  ListArtifactsResponse,
  UploadArtifactOptions,
  UploadArtifactResponse
} from './shared/interfaces.js'
import { uploadArtifact } from './upload/upload-artifact.js'

/**
 * Generic interface for the artifact client.
 */
export interface ArtifactClient {
  /**
   * Uploads an artifact.
   *
   * @param name Artifact Name
   * @param files File(s) to Upload
   * @param rootDirectory Root Directory
   * @param options Upload Options
   * @returns Upload Artifact Response
   */
  uploadArtifact(
    name: string,
    files: string[],
    rootDirectory: string,
    options?: UploadArtifactOptions
  ): Promise<UploadArtifactResponse>

  /**
   * List all artifacts for a workflow run.
   *
   * If `options.findBy` is specified, this will call the public List-Artifacts
   * API which can list from other runs.
   *
   * @param options List Artifact Options
   * @returns List Artifact Response
   */
  listArtifacts(
    options?: ListArtifactsOptions & FindOptions
  ): Promise<ListArtifactsResponse>

  /**
   * Finds an artifact by name.
   *
   * If there are multiple artifacts with the same name in the same workflow
   * run, this will return the latest. If the artifact is not found, it will
   * throw.
   *
   * If `options.findBy` is specified, this will use the public List Artifacts
   * API with a name filter which can get artifacts from other runs.
   *
   * @param artifactName Artifact Name
   * @param options Get Artifact Options
   * @returns Get Artifact Response
   */
  getArtifact(
    artifactName: string,
    options?: FindOptions
  ): Promise<GetArtifactResponse>

  /**
   * Downloads an artifact and unzips the content.
   *
   * If `options.findBy` is specified, this will use the public Download
   * Artifact API.
   *
   * @param artifactId Artifact ID
   * @param options Download Artifact Options
   * @returns Download Artifact Response
   */
  downloadArtifact(
    artifactId: number,
    options?: DownloadArtifactOptions & FindOptions
  ): Promise<DownloadArtifactResponse>

  /**
   * Deletes an artifact.
   *
   * If `options.findBy` is specified, this will use the public Delete Artifact
   * API
   *
   * @param artifactName Artifact Name
   * @param options Delete Artifact Options
   * @returns Delete Artifact Response
   */
  deleteArtifact(
    artifactName: string,
    options?: FindOptions
  ): Promise<DeleteArtifactResponse>
}

/**
 * Default artifact client that is used by the artifact action(s).
 */
export class DefaultArtifactClient implements ArtifactClient {
  /**
   * Uploads an artifact.
   *
   * @remarks
   *
   * - Adds a check for the LOCAL_ACTION_ARTIFACT_PATH variable.
   *
   * @param name Artifact Name
   * @param files File(s) to Upload
   * @param rootDirectory Root Directory
   * @param options Upload Options
   * @returns Upload Artifact Response
   */
  async uploadArtifact(
    name: string,
    files: string[],
    rootDirectory: string,
    options?: UploadArtifactOptions
  ): Promise<UploadArtifactResponse> {
    if (!process.env.LOCAL_ACTION_ARTIFACT_PATH)
      throw new Error(
        'LOCAL_ACTION_ARTIFACT_PATH must be set when interacting with @actions/artifact!'
      )

    try {
      if (isGhes()) throw new GHESNotSupportedError()

      return uploadArtifact(name, files, rootDirectory, options)
    } catch (error) {
      warning(
        `Artifact upload failed with error: ${error}.

Errors can be temporary, so please try again and optionally run the action with debug mode enabled for more information.

If the error persists, please check whether Actions is operating normally at [https://githubstatus.com](https://www.githubstatus.com).`
      )

      throw error
    }
  }

  /**
   * Downloads an artifact and unzips the content.
   *
   * If `options.findBy` is specified, this will use the public Download
   * Artifact API.
   *
   * @remarks
   *
   * - Adds a check for the LOCAL_ACTION_ARTIFACT_PATH variable.
   *
   * @param artifactId Artifact ID
   * @param options Download Artifact Options
   * @returns Download Artifact Response
   */
  async downloadArtifact(
    artifactId: number,
    options?: DownloadArtifactOptions & FindOptions
  ): Promise<DownloadArtifactResponse> {
    if (!process.env.LOCAL_ACTION_ARTIFACT_PATH)
      throw new Error(
        'LOCAL_ACTION_ARTIFACT_PATH must be set when interacting with @actions/artifact!'
      )

    try {
      if (isGhes()) throw new GHESNotSupportedError()

      if (options?.findBy) {
        const {
          findBy: { repositoryOwner, repositoryName, token },
          ...downloadOptions
        } = options

        return downloadArtifactPublic(
          artifactId,
          repositoryOwner,
          repositoryName,
          token,
          downloadOptions
        )
      }

      return downloadArtifactInternal(artifactId, options)
    } catch (error) {
      warning(
        `Download Artifact failed with error: ${error}.

Errors can be temporary, so please try again and optionally run the action with debug mode enabled for more information.

If the error persists, please check whether Actions and API requests are operating normally at [https://githubstatus.com](https://www.githubstatus.com).`
      )

      throw error
    }
  }

  /**
   * List all artifacts for a workflow run.
   *
   * If `options.findBy` is specified, this will call the public List-Artifacts
   * API which can list from other runs.
   *
   * @remarks
   *
   * - Adds a check for the LOCAL_ACTION_ARTIFACT_PATH variable.
   *
   * @param options Extra options that allow for the customization of the list behavior
   * @returns ListArtifactResponse object
   */
  async listArtifacts(
    options?: ListArtifactsOptions & FindOptions
  ): Promise<ListArtifactsResponse> {
    if (!process.env.LOCAL_ACTION_ARTIFACT_PATH)
      throw new Error(
        'LOCAL_ACTION_ARTIFACT_PATH must be set when interacting with @actions/artifact!'
      )

    try {
      if (isGhes()) throw new GHESNotSupportedError()

      if (options?.findBy) {
        const {
          findBy: { workflowRunId, repositoryOwner, repositoryName, token }
        } = options

        return listArtifactsPublic(
          workflowRunId,
          repositoryOwner,
          repositoryName,
          token,
          options?.latest
        )
      }

      return listArtifactsInternal(options?.latest)
    } catch (error: unknown) {
      warning(
        `Listing Artifacts failed with error: ${error}.

Errors can be temporary, so please try again and optionally run the action with debug mode enabled for more information.

If the error persists, please check whether Actions and API requests are operating normally at [https://githubstatus.com](https://www.githubstatus.com).`
      )

      throw error
    }
  }

  /**
   * Finds an artifact by name.
   *
   * If there are multiple artifacts with the same name in the same workflow
   * run, this will return the latest. If the artifact is not found, it will
   * throw.
   *
   * If `options.findBy` is specified, this will use the public List Artifacts
   * API with a name filter which can get artifacts from other runs.
   *
   * @remarks
   *
   * - Adds a check for the LOCAL_ACTION_ARTIFACT_PATH variable.
   *
   * @param artifactName Artifact Name
   * @param options Get Artifact Options
   * @returns Get Artifact Response
   */
  async getArtifact(
    artifactName: string,
    options?: FindOptions
  ): Promise<GetArtifactResponse> {
    if (!process.env.LOCAL_ACTION_ARTIFACT_PATH)
      throw new Error(
        'LOCAL_ACTION_ARTIFACT_PATH must be set when interacting with @actions/artifact!'
      )

    try {
      if (isGhes()) throw new GHESNotSupportedError()

      if (options?.findBy) {
        const {
          findBy: { workflowRunId, repositoryOwner, repositoryName, token }
        } = options

        return getArtifactPublic(
          artifactName,
          workflowRunId,
          repositoryOwner,
          repositoryName,
          token
        )
      }

      return getArtifactInternal(artifactName)
    } catch (error: unknown) {
      warning(
        `Get Artifact failed with error: ${error}.

Errors can be temporary, so please try again and optionally run the action with debug mode enabled for more information.

If the error persists, please check whether Actions and API requests are operating normally at [https://githubstatus.com](https://www.githubstatus.com).`
      )
      throw error
    }
  }

  /**
   * Deletes an artifact.
   *
   * If `options.findBy` is specified, this will use the public Delete Artifact
   * API
   *
   * @remarks
   *
   * - Adds a check for the LOCAL_ACTION_ARTIFACT_PATH variable.
   *
   * @param artifactName Artifact Name
   * @param options Delete Artifact Options
   * @returns Delete Artifact Response
   */
  async deleteArtifact(
    artifactName: string,
    options?: FindOptions
  ): Promise<DeleteArtifactResponse> {
    if (!process.env.LOCAL_ACTION_ARTIFACT_PATH)
      throw new Error(
        'LOCAL_ACTION_ARTIFACT_PATH must be set when interacting with @actions/artifact!'
      )

    try {
      if (isGhes()) throw new GHESNotSupportedError()

      if (options?.findBy) {
        const {
          findBy: { repositoryOwner, repositoryName, workflowRunId, token }
        } = options

        return deleteArtifactPublic(
          artifactName,
          workflowRunId,
          repositoryOwner,
          repositoryName,
          token
        )
      }

      return deleteArtifactInternal(artifactName)
    } catch (error) {
      warning(
        `Delete Artifact failed with error: ${error}.

Errors can be temporary, so please try again and optionally run the action with debug mode enabled for more information.

If the error persists, please check whether Actions and API requests are operating normally at [https://githubstatus.com](https://www.githubstatus.com).`
      )

      throw error
    }
  }
}
