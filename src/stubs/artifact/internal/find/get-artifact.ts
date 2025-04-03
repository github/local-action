/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/internal/find/get-artifact.ts
 */

import type { OctokitOptions } from '@octokit/core'
import { requestLog } from '@octokit/plugin-request-log'
import { retry } from '@octokit/plugin-retry'
import { EnvMeta } from '../../../../stubs/env.js'
import * as core from '../../../core/core.js'
import { getOctokit } from '../../../github/github.js'
import { defaults as defaultGitHubOptions } from '../../../github/utils.js'
import {
  ArtifactNotFoundError,
  InvalidResponseError
} from '../shared/errors.js'
import type { Artifact, GetArtifactResponse } from '../shared/interfaces.js'
import { getUserAgentString } from '../shared/user-agent.js'
import { getRetryOptions } from './retry-options.js'

/**
 * Gets the artifact from the GitHub API.
 *
 * @remarks
 *
 * - Removed digest from the artifact interface.
 *
 * @param artifactName Artifact Name
 * @param workflowRunId Workflow Run ID
 * @param repositoryOwner Repository Owner
 * @param repositoryName Repository Name
 * @param token Token
 * @returns Get Artifact Response
 */
export async function getArtifactPublic(
  artifactName: string,
  workflowRunId: number,
  repositoryOwner: string,
  repositoryName: string,
  token: string
): Promise<GetArtifactResponse> {
  const [retryOpts, requestOpts] = getRetryOptions(defaultGitHubOptions)

  const opts: OctokitOptions = {
    log: undefined,
    userAgent: getUserAgentString(),
    previews: undefined,
    retry: retryOpts,
    request: requestOpts
  }

  const github = getOctokit(token, opts, retry as any, requestLog as any)

  const getArtifactResp = await github.request(
    'GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts{?name}',
    {
      owner: repositoryOwner,
      repo: repositoryName,
      run_id: workflowRunId,
      name: artifactName
    }
  )

  if (getArtifactResp.status !== 200)
    throw new InvalidResponseError(
      `Invalid response from GitHub API: ${getArtifactResp.status} (${getArtifactResp?.headers?.['x-github-request-id']})`
    )

  if (getArtifactResp.data.artifacts.length === 0)
    throw new ArtifactNotFoundError(
      `Artifact not found for name: ${artifactName}
        Please ensure that your artifact is not expired and the artifact was uploaded using a compatible version of toolkit/upload-artifact.
        For more information, visit the GitHub Artifacts FAQ: https://github.com/actions/toolkit/blob/main/packages/artifact/docs/faq.md`
    )

  let artifact = getArtifactResp.data.artifacts[0]
  if (getArtifactResp.data.artifacts.length > 1) {
    artifact = getArtifactResp.data.artifacts.sort(
      (a: Artifact, b: Artifact) => b.id - a.id
    )[0]
    core.debug(
      `More than one artifact found for a single name, returning newest (id: ${artifact.id})`
    )
  }

  return {
    artifact: {
      name: artifact.name,
      id: artifact.id,
      size: artifact.size_in_bytes,
      createdAt: artifact.created_at ? new Date(artifact.created_at) : undefined
    }
  }
}

/**
 * Gets the artifact from this workflow run.
 *
 * @remarks
 *
 * - Removed digest from the artifact interface.
 * - Gets artifacts from environment metadata.
 *
 * @param artifactName Artifact Name
 * @returns Get Artifact Response
 */
export async function getArtifactInternal(
  artifactName: string
): Promise<GetArtifactResponse> {
  // Get all artifacts with a matching name, sorted by latest (highest ID).
  const artifacts = EnvMeta.artifacts
    .filter(artifact => artifact.name === artifactName)
    .sort((a, b) => Number(b.id) - Number(a.id))

  if (artifacts.length === 0) {
    throw new ArtifactNotFoundError(
      `Artifact not found for name: ${artifactName}
        Please ensure that your artifact is not expired and the artifact was uploaded using a compatible version of toolkit/upload-artifact.
        For more information, visit the GitHub Artifacts FAQ: https://github.com/actions/toolkit/blob/main/packages/artifact/docs/faq.md`
    )
  }

  if (artifacts.length > 1)
    core.debug(
      `More than one artifact found for a single name, returning newest (id: ${artifacts[0].id})`
    )

  return {
    artifact: {
      name: artifacts[0].name,
      id: Number(artifacts[0].id),
      size: Number(artifacts[0].size),
      createdAt: artifacts[0].createdAt
    }
  }
}
