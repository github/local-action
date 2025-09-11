/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/main/packages/cache/src/internal/cacheUtils.ts
 * Last Reviewed Date: 2025-09-10
 *
 * @remarks
 *
 * - Deleted assertDefined function
 * - Deleted getRuntimeToken function
 */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as semver from 'semver'
import * as util from 'util'
import {
  CacheFilename,
  CompressionMethod,
  GnuTarPathOnWindows
} from './constants.js'

const versionSalt = '1.0'

/**
 * Creates a temporary directory and returns the path
 *
 * @returns Path to the temporary directory
 *
 * @remarks
 *
 * - Replaces location with LOCAL_ACTION_WORKSPACE/actions/temp
 */
export async function createTempDirectory(): Promise<string> {
  const tempDirectory = path.join(
    process.env.LOCAL_ACTION_WORKSPACE!,
    'actions',
    'temp'
  )
  const dest = path.join(tempDirectory, crypto.randomUUID())

  await io.mkdirP(dest)

  return dest
}

/**
 * Gets the size of the archive file in bytes
 *
 * @param filePath Path to the archive file
 * @returns Size of the archive file in bytes
 */
/* istanbul ignore next */
export function getArchiveFileSizeInBytes(filePath: string): number {
  return fs.statSync(filePath).size
}

/**
 * Resolves the paths to be cached
 *
 * @param patterns Array of glob patterns
 * @returns Array of resolved paths
 */
/* istanbul ignore next */
export async function resolvePaths(patterns: string[]): Promise<string[]> {
  const paths: string[] = []
  const workspace = process.env['GITHUB_WORKSPACE'] ?? process.cwd()
  const globber = await glob.create(patterns.join('\n'), {
    implicitDescendants: false
  })

  for await (const file of globber.globGenerator()) {
    const relativeFile = path
      .relative(workspace, file)
      .replace(new RegExp(`\\${path.sep}`, 'g'), '/')
    core.debug(`Matched: ${relativeFile}`)

    // Paths are made relative so the tar entries are all relative to the root
    // of the workspace.
    if (relativeFile === '') paths.push('.')
    else paths.push(`${relativeFile}`)
  }

  return paths
}

/**
 * Deletes a file
 *
 * @param filePath Path to the file
 * @returns Promise that resolves when the file is deleted
 */
/* istanbul ignore next */
export async function unlinkFile(filePath: fs.PathLike): Promise<void> {
  return util.promisify(fs.unlink)(filePath)
}

/**
 * Gets the version of an application by executing it with the provided
 * arguments
 *
 * @param app Application to get the version of
 * @param additionalArgs Additional arguments to pass to the application
 * @returns Version of the application
 */
/* istanbul ignore next */
async function getVersion(
  app: string,
  additionalArgs: string[] = []
): Promise<string> {
  let versionOutput = ''
  additionalArgs.push('--version')
  core.debug(`Checking ${app} ${additionalArgs.join(' ')}`)

  try {
    await exec.exec(`${app}`, additionalArgs, {
      ignoreReturnCode: true,
      silent: true,
      listeners: {
        stdout: (data: Buffer): string => (versionOutput += data.toString()),
        stderr: (data: Buffer): string => (versionOutput += data.toString())
      }
    })
  } catch (err: any) {
    core.debug(err.message)
  }

  versionOutput = versionOutput.trim()
  core.debug(versionOutput)

  return versionOutput
}

/**
 * Gets the compression method to use when creating caches.
 *
 * Use zstandard if possible to maximize cache performance.
 */
/* istanbul ignore next */
export async function getCompressionMethod(): Promise<CompressionMethod> {
  const versionOutput = await getVersion('zstd', ['--quiet'])
  const version = semver.clean(versionOutput)

  core.debug(`zstd version: ${version}`)

  if (versionOutput === '') return CompressionMethod.Gzip
  else return CompressionMethod.ZstdWithoutLong
}

/**
 * Gets the cache file name based on the compression method
 *
 * @param compressionMethod Compression method
 * @returns Cache file name
 */
/* istanbul ignore next */
export function getCacheFileName(compressionMethod: CompressionMethod): string {
  return compressionMethod === CompressionMethod.Gzip
    ? CacheFilename.Gzip
    : CacheFilename.Zstd
}

/**
 * Gets the path to GNU tar on Windows, if available
 *
 * @returns Path to GNU tar on Windows, or empty string if not available
 */
/* istanbul ignore next */
export async function getGnuTarPathOnWindows(): Promise<string> {
  if (fs.existsSync(GnuTarPathOnWindows)) return GnuTarPathOnWindows

  const versionOutput = await getVersion('tar')
  return versionOutput.toLowerCase().includes('gnu tar') ? io.which('tar') : ''
}

/**
 * Get the cache version
 *
 * @param paths Paths included in the cache
 * @param compressionMethod Compression method
 * @param enableCrossOsArchive Enable cross OS archive
 * @returns Cache version
 */
/* istanbul ignore next */
export function getCacheVersion(
  paths: string[],
  compressionMethod?: CompressionMethod,
  enableCrossOsArchive = false
): string {
  // don't pass changes upstream
  const components = paths.slice()

  // Add compression method to cache version to restore
  // compressed cache as per compression method
  if (compressionMethod) components.push(compressionMethod)

  // Only check for windows platforms if enableCrossOsArchive is false
  if (process.platform === 'win32' && !enableCrossOsArchive)
    components.push('windows-only')

  // Add salt to cache version to support breaking changes in cache entry
  components.push(versionSalt)

  return crypto.createHash('sha256').update(components.join('|')).digest('hex')
}
