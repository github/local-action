import * as httpClient from '@actions/http-client'
import fs from 'fs'
import path from 'path'
import { finished } from 'stream/promises'
import unzip from 'unzip-stream'
import { EnvMeta } from '../../../../stubs/env.js'
import * as core from '../../../core/core.js'
import { getOctokit } from '../../../github/github.js'
import { getGitHubWorkspaceDir } from '../shared/config.js'
import { ArtifactNotFoundError } from '../shared/errors.js'
import type {
  Artifact,
  DownloadArtifactOptions,
  DownloadArtifactResponse
} from '../shared/interfaces.js'
import { getUserAgentString } from '../shared/user-agent.js'

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
const scrubQueryParameters = (url: string): string => {
  const parsed = new URL(url)
  parsed.search = ''
  return parsed.toString()
}

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
async function exists(path: string): Promise<boolean> {
  try {
    fs.accessSync(path)
    return true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ENOENT') return false
    else throw error
  }
}

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
async function streamExtract(url: string, directory: string): Promise<void> {
  let retryCount = 0
  while (retryCount < 5) {
    try {
      await streamExtractExternal(url, directory)
      return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      retryCount++
      core.debug(
        `Failed to download artifact after ${retryCount} retries due to ${error.message}. Retrying in 5 seconds...`
      )
      // wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  throw new Error(`Artifact download failed after ${retryCount} retries.`)
}

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
export async function streamExtractExternal(
  url: string,
  directory: string
): Promise<void> {
  const client = new httpClient.HttpClient(getUserAgentString())
  const response = await client.get(url)
  if (response.message.statusCode !== 200) {
    throw new Error(
      `Unexpected HTTP response from blob storage: ${response.message.statusCode} ${response.message.statusMessage}`
    )
  }

  const timeout = 30 * 1000 // 30 seconds

  return new Promise((resolve, reject) => {
    const timerFn = (): void => {
      response.message.destroy(
        new Error(`Blob storage chunk did not respond in ${timeout}ms`)
      )
    }
    const timer = setTimeout(timerFn, timeout)

    response.message
      .on('data', () => {
        timer.refresh()
      })
      .on('error', (error: Error) => {
        core.debug(
          `response.message: Artifact download failed: ${error.message}`
        )
        clearTimeout(timer)
        reject(error)
      })
      .pipe(unzip.Extract({ path: directory }))
      .on('close', () => {
        clearTimeout(timer)
        resolve()
      })
      .on('error', (error: Error) => {
        reject(error)
      })
  })
}

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
export async function downloadArtifactPublic(
  artifactId: number,
  repositoryOwner: string,
  repositoryName: string,
  token: string,
  options?: DownloadArtifactOptions
): Promise<DownloadArtifactResponse> {
  const downloadPath = await resolveOrCreateDirectory(options?.path)

  const api = getOctokit(token)

  core.info(
    `Downloading artifact '${artifactId}' from '${repositoryOwner}/${repositoryName}'`
  )

  const { headers, status } = await api.rest.actions.downloadArtifact({
    owner: repositoryOwner,
    repo: repositoryName,
    artifact_id: artifactId,
    archive_format: 'zip',
    request: {
      redirect: 'manual'
    }
  })

  if (status !== 302)
    throw new Error(`Unable to download artifact. Unexpected status: ${status}`)

  const { location } = headers
  if (!location) throw new Error(`Unable to redirect to artifact download url`)

  core.info(
    `Redirecting to blob download url: ${scrubQueryParameters(location)}`
  )

  try {
    core.info(`Starting download of artifact to: ${downloadPath}`)
    await streamExtract(location, downloadPath)
    core.info(`Artifact download completed successfully.`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(`Unable to download and extract artifact: ${error.message}`)
  }

  return { downloadPath }
}

/**
 * @github/local-action Modified
 */
export async function downloadArtifactInternal(
  artifactId: number,
  options?: DownloadArtifactOptions
): Promise<DownloadArtifactResponse> {
  const downloadPath = await resolveOrCreateDirectory(options?.path)

  // Check the current list of artifacts for one with a matching ID.
  const artifacts: Artifact[] = EnvMeta.artifacts.filter(
    (artifact: Artifact) => artifact.id === artifactId
  )

  if (artifacts.length === 0)
    throw new ArtifactNotFoundError(
      `No artifacts found for ID: ${artifactId}\nAre you trying to download from a different run? Try specifying a github-token with \`actions:read\` scope.`
    )

  try {
    core.info(`Starting download of artifact to: ${downloadPath}`)

    // Extract the file to the specified directory. The archive will be
    // available at `${LOCAL_ACTION_ARTIFACT_PATH}/${artifact.id}`.
    const readStream = fs.createReadStream(
      path.join(
        process.env.LOCAL_ACTION_ARTIFACT_PATH!,
        `${artifacts[0].name}.zip`
      )
    )

    readStream.pipe(unzip.Extract({ path: downloadPath }))

    await finished(readStream)

    core.info(`Artifact download completed successfully.`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    /* istanbul ignore next */
    throw new Error(`Unable to download and extract artifact: ${error.message}`)
  }

  return { downloadPath }
}

/**
 * @github/local-action Unmodified
 */
/* istanbul ignore next */
async function resolveOrCreateDirectory(
  downloadPath = getGitHubWorkspaceDir()
): Promise<string> {
  if (!(await exists(downloadPath))) {
    core.debug(
      `Artifact destination folder does not exist, creating: ${downloadPath}`
    )
    fs.mkdirSync(downloadPath, { recursive: true })
  } else
    core.debug(`Artifact destination folder already exists: ${downloadPath}`)

  return downloadPath
}
