/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/internal/find/get-artifact.ts
 * Last Reviewed Date: 2025-09-10
 */

import type { OctokitOptions } from '@octokit/core'
import { requestLog } from '@octokit/plugin-request-log'
import { retry } from '@octokit/plugin-retry'
import { EnvMeta } from '../../../../stubs/env.js'
import * as core from '../../../core/core.js'
import { getOctokit } from '../../../github/github.js'
import { defaults as defaultGitHubOptions } from '../../../github/utils.js'
import type { Artifact, ListArtifactsResponse } from '../shared/interfaces.js'
import { getUserAgentString } from '../shared/user-agent.js'
import { getRetryOptions } from './retry-options.js'

// Limiting to 1000 for perf reasons
const maximumArtifactCount = 1000
const paginationCount = 100
const maxNumberOfPages = maximumArtifactCount / paginationCount

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
  if (totalArtifactCount > maximumArtifactCount) {
    core.warning(
      `Workflow run ${workflowRunId} has more than 1000 artifacts. Results will be incomplete as only the first ${maximumArtifactCount} artifacts will be returned`
    )
    numberOfPages = maxNumberOfPages
  }

  // Iterate over the first page
  for (const artifact of listArtifactResponse.artifacts) {
    artifacts.push({
      name: artifact.name,
      id: artifact.id,
      size: artifact.size_in_bytes,
      createdAt: artifact.created_at ? new Date(artifact.created_at) : undefined
    })
  }

  // Iterate over any remaining pages
  /* istanbul ignore next */
  for (
    currentPageNumber;
    currentPageNumber < numberOfPages;
    currentPageNumber++
  ) {
    currentPageNumber++
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
          : undefined
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
