/**
 * Last Reviewed Commit: fea4f6b5c527a8f231cfb9e2530a2f367e971faa
 * Last Reviewed Date: 2026-01-16
 */

import type { OctokitOptions } from '@octokit/core'
import { requestLog } from '@octokit/plugin-request-log'
import { retry } from '@octokit/plugin-retry'
import { EnvMeta } from '../../../../stubs/env.js'
import * as core from '../../../core/core.js'
import { getOctokit } from '../../../github/github.js'
import { defaults as defaultGitHubOptions } from '../../../github/utils.js'
import { getMaxArtifactListCount } from '../shared/config.js'
import type { Artifact, ListArtifactsResponse } from '../shared/interfaces.js'
import { getUserAgentString } from '../shared/user-agent.js'
import { getRetryOptions } from './retry-options.js'

const paginationCount = 100

/**
 * Lists artifacts for a given workflow run.
 *
 * @remarks
 *
 * - Removed digest from the artifact interface.
 *
 * @param workflowRunId Workflow Run ID
 * @param repositoryOwner Repository Owner
 * @param repositoryName Repository Name
 * @param token Token
 * @param latest Latest
 * @returns List Artifacts Response
 */
export async function listArtifactsPublic(
  workflowRunId: number,
  repositoryOwner: string,
  repositoryName: string,
  token: string,
  latest = false
): Promise<ListArtifactsResponse> {
  core.info(
    `Fetching artifact list for workflow run ${workflowRunId} in repository ${repositoryOwner}/${repositoryName}`
  )

  let artifacts: Artifact[] = []
  const [retryOpts, requestOpts] = getRetryOptions(defaultGitHubOptions)

  const opts: OctokitOptions = {
    log: undefined,
    userAgent: getUserAgentString(),
    previews: undefined,
    retry: retryOpts,
    request: requestOpts
  }

  const github = getOctokit(token, opts, retry as any, requestLog as any)

  let currentPageNumber = 1

  const { data: listArtifactResponse } =
    await github.rest.actions.listWorkflowRunArtifacts({
      owner: repositoryOwner,
      repo: repositoryName,
      run_id: workflowRunId,
      per_page: paginationCount,
      page: currentPageNumber
    })

  let numberOfPages = Math.ceil(
    listArtifactResponse.total_count / paginationCount
  )
  const totalArtifactCount = listArtifactResponse.total_count
  if (totalArtifactCount > getMaxArtifactListCount()) {
    core.warning(
      `Workflow run ${workflowRunId} has more than 1000 artifacts. Results will be incomplete as only the first ${getMaxArtifactListCount()} artifacts will be returned`
    )
    numberOfPages = Math.ceil(getMaxArtifactListCount() / paginationCount)
  }

  // Iterate over the first page
  for (const artifact of listArtifactResponse.artifacts) {
    artifacts.push({
      name: artifact.name,
      id: artifact.id,
      size: artifact.size_in_bytes,
      createdAt: artifact.created_at
        ? new Date(artifact.created_at)
        : undefined,
      digest: (artifact as ArtifactResponse).digest
    })
  }

  // Move to the next page
  currentPageNumber++

  // Iterate over any remaining pages
  /* istanbul ignore next */
  for (
    currentPageNumber;
    currentPageNumber <= numberOfPages;
    currentPageNumber++
  ) {
    core.debug(`Fetching page ${currentPageNumber} of artifact list`)

    const { data: listArtifactResponse } =
      await github.rest.actions.listWorkflowRunArtifacts({
        owner: repositoryOwner,
        repo: repositoryName,
        run_id: workflowRunId,
        per_page: paginationCount,
        page: currentPageNumber
      })

    for (const artifact of listArtifactResponse.artifacts) {
      artifacts.push({
        name: artifact.name,
        id: artifact.id,
        size: artifact.size_in_bytes,
        createdAt: artifact.created_at
          ? new Date(artifact.created_at)
          : undefined,
        digest: (artifact as ArtifactResponse).digest
      })
    }
  }

  if (latest) artifacts = filterLatest(artifacts)

  core.info(`Found ${artifacts.length} artifact(s)`)

  return {
    artifacts
  }
}

/**
 * List artifacts for this workflow run.
 *
 * @remarks
 *
 * - Uses environment metadata for tracking artifacts.
 *
 * @param latest Latest
 * @returns List Artifacts Response
 */
export async function listArtifactsInternal(
  latest = false
): Promise<ListArtifactsResponse> {
  const artifacts = latest ? filterLatest(EnvMeta.artifacts) : EnvMeta.artifacts

  core.info(`Found ${artifacts.length} artifact(s)`)

  return {
    artifacts
  }
}

/**
 * This exists so that we don't have to use 'any' when receiving the artifact
 * list from the GitHub API. The digest field is not present in OpenAPI/types at
 * time of writing, which necessitates this change.
 */
interface ArtifactResponse {
  name: string
  id: number
  size_in_bytes: number
  created_at?: string
  digest?: string
}

/**
 * Filters a list of artifacts to only include the latest artifact for each name
 *
 * @param artifacts The artifacts to filter
 * @returns The filtered list of artifacts
 */
function filterLatest(artifacts: Artifact[]): Artifact[] {
  artifacts.sort((a, b) => b.id - a.id)
  const latestArtifacts: Artifact[] = []
  const seenArtifactNames = new Set<string>()
  for (const artifact of artifacts) {
    if (!seenArtifactNames.has(artifact.name)) {
      latestArtifacts.push(artifact)
      seenArtifactNames.add(artifact.name)
    }
  }
  return latestArtifacts
}
