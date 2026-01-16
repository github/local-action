/**
 * Last Reviewed Commit: 9b08f07cd305c6060f08e4b64d1805429a773711
 * Last Reviewed Date: 2026-01-16
 */

import * as httpClient from '@actions/http-client'
import * as crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import * as stream from 'stream'
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
import { StreamExtractResponse } from '../shared/interfaces.js'
import { getUserAgentString } from '../shared/user-agent.js'

/**
 * Removes query parameters from a URL.
 *
 * @remarks
 *
 * - Exporting the function to make it available for testing.
 *
 * @param url URL
 * @returns URL without query parameters
 */
export const scrubQueryParameters = (url: string): string => {
  const parsed = new URL(url)
  parsed.search = ''
  return parsed.toString()
}

/**
 * Checks if a path exists
 *
 * @remarks
 *
 * - Exporting the function to make it available for testing.
 * - Use `accessSync` instead of `access`.
 *
 * @param path Path
 * @returns `true` if the path exists, `false` otherwise
 */
export function exists(path: string): boolean {
  try {
    fs.accessSync(path)
    return true
  } catch (error: any) {
    if (error.code === 'ENOENT') return false
    else throw error
  }
}

/**
 * Extract the artifact from the given URL to the specified directory.
 *
 * @param url URL
 * @param directory Directory
 */
/* istanbul ignore next */
async function streamExtract(
  url: string,
  directory: string
): Promise<StreamExtractResponse> {
  let retryCount = 0
  while (retryCount < 5) {
    try {
      return await streamExtractExternal(url, directory)
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
 * Extract the artifact from the given URL to the specified directory.
 *
 * @remarks
 *
 * - Removed digest verification from the original implementation.
 *
 * @param url URL
 * @param directory Directory
 */
/* istanbul ignore next */
export async function streamExtractExternal(
  url: string,
  directory: string,
  opts: { timeout: number } = { timeout: 30 * 1000 }
): Promise<StreamExtractResponse> {
  const client = new httpClient.HttpClient(getUserAgentString())
  const response = await client.get(url)
  if (response.message.statusCode !== 200)
    throw new Error(
      `Unexpected HTTP response from blob storage: ${response.message.statusCode} ${response.message.statusMessage}`
    )

  let sha256Digest: string | undefined = undefined

  return new Promise((resolve, reject) => {
    const timerFn = (): void => {
      const timeoutError = new Error(
        `Blob storage chunk did not respond in ${opts.timeout}ms`
      )
      response.message.destroy(timeoutError)
      reject(timeoutError)
    }
    const timer = setTimeout(timerFn, opts.timeout)

    const hashStream = crypto.createHash('sha256').setEncoding('hex')
    const passThrough = new stream.PassThrough()

    response.message.pipe(passThrough)
    passThrough.pipe(hashStream)
    const extractStream = passThrough

    extractStream
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
        if (hashStream) {
          hashStream.end()
          sha256Digest = hashStream.read() as string
          core.info(`SHA256 digest of downloaded artifact is ${sha256Digest}`)
        }
        resolve({ sha256Digest: `sha256:${sha256Digest}` })
      })
      .on('error', (error: Error) => {
        reject(error)
      })
  })
}

/**
 * Download an artifact from the given repository to the specified directory.
 *
 * @remarks
 *
 * - Removed digest verification from the original implementation.
 *
 * @param artifactId Artifact ID
 * @param repositoryOwner Repository Owner
 * @param repositoryName Repository Name
 * @param token Token
 * @param options Options
 * @returns Download Artifact Response
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

  let digestMismatch = false

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
    const extractResponse = await streamExtract(location, downloadPath)
    core.info(`Artifact download completed successfully.`)
    if (options?.expectedHash)
      if (options?.expectedHash !== extractResponse.sha256Digest) {
        digestMismatch = true
        core.debug(`Computed digest: ${extractResponse.sha256Digest}`)
        core.debug(`Expected digest: ${options.expectedHash}`)
      }
  } catch (error: any) {
    throw new Error(`Unable to download and extract artifact: ${error.message}`)
  }

  return { downloadPath, digestMismatch }
}

/**
 * Downloads an artifact from the current repository to the specified directory.
 *
 * @remarks
 *
 * - Removed digest verification from the original implementation.
 * - Downloads from local filesystem instead of GitHub.
 *
 * @param artifactId Artifact ID
 * @param options Options
 * @returns Download Artifact Response
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

  if (artifacts.length > 1)
    core.warning('Multiple artifacts found, defaulting to first.')

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
  } catch (error: any) {
    throw new Error(`Unable to download and extract artifact: ${error.message}`)
  }

  return { downloadPath, digestMismatch: false }
}

/**
 * Resolves or creates a directory.
 *
 * @param downloadPath Download Path
 * @returns Download Path
 */
/* istanbul ignore next */
async function resolveOrCreateDirectory(
  downloadPath = getGitHubWorkspaceDir()
): Promise<string> {
  if (!exists(downloadPath)) {
    core.debug(
      `Artifact destination folder does not exist, creating: ${downloadPath}`
    )
    fs.mkdirSync(downloadPath, { recursive: true })
  } else
    core.debug(`Artifact destination folder already exists: ${downloadPath}`)

  return downloadPath
}
