import type { OctokitOptions } from '@octokit/core'
import { requestLog } from '@octokit/plugin-request-log'
import { retry } from '@octokit/plugin-retry'
import fs from 'fs'
import path from 'path'
import { EnvMeta } from '../../../../stubs/env.js'
import { getOctokit } from '../../../../stubs/github/github.ts'
import * as core from '../../../core/core.js'
import { defaults as defaultGitHubOptions } from '../../../github/utils.js'
import { getArtifactPublic } from '../find/get-artifact.js'
import { getRetryOptions } from '../find/retry-options.js'
import {
  ArtifactNotFoundError,
  InvalidResponseError
} from '../shared/errors.js'
import type { Artifact, DeleteArtifactResponse } from '../shared/interfaces.js'
import { getUserAgentString } from '../shared/user-agent.js'

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
export async function deleteArtifactPublic(
  artifactName: string,
  workflowRunId: number,
  repositoryOwner: string,
  repositoryName: string,
  token: string
): Promise<DeleteArtifactResponse> {
  const [retryOpts, requestOpts] = getRetryOptions(defaultGitHubOptions)

  const opts: OctokitOptions = {
    log: undefined,
    userAgent: getUserAgentString(),
    previews: undefined,
    retry: retryOpts,
    request: requestOpts
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const github = getOctokit(token, opts, retry as any, requestLog as any)
  const getArtifactResp = await getArtifactPublic(
    artifactName,
    workflowRunId,
    repositoryOwner,
    repositoryName,
    token
  )

  const deleteArtifactResp = await github.rest.actions.deleteArtifact({
    owner: repositoryOwner,
    repo: repositoryName,
    artifact_id: getArtifactResp.artifact.id
  })

  if (deleteArtifactResp.status !== 204) {
    throw new InvalidResponseError(
      `Invalid response from GitHub API: ${deleteArtifactResp.status} (${deleteArtifactResp?.headers?.['x-github-request-id']})`
    )
  }

  return {
    id: getArtifactResp.artifact.id
  }
}

/**
 * @github/local-action Modified
 */
export async function deleteArtifactInternal(
  artifactName: string
): Promise<DeleteArtifactResponse> {
  // Check the current list of artifacts for one with a matching name, sorted by
  // most recent (highest ID).
  const artifacts: Artifact[] = EnvMeta.artifacts
    .filter((artifact: Artifact) => artifact.name === artifactName)
    .sort((a, b) => Number(b.id) - Number(a.id))

  if (artifacts.length === 0)
    throw new ArtifactNotFoundError(
      `Artifact not found for name: ${artifactName}`
    )

  if (artifacts.length > 1)
    core.debug(
      `More than one artifact found for a single name, returning newest (id: ${artifacts[0].id})`
    )

  const id = artifacts[0].id

  // Delete the artifact from the filesystem.
  fs.rmSync(
    path.join(
      process.env.LOCAL_ACTION_ARTIFACT_PATH!,
      `${artifacts[0].name}.zip`
    )
  )

  // Remove the artifact from the list of artifacts.
  EnvMeta.artifacts = EnvMeta.artifacts.filter(
    (artifact: Artifact) => artifact.id !== id
  )

  core.info(`Artifact '${artifactName}' (ID: ${id}) deleted`)

  return {
    id
  }
}
