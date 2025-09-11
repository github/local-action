/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/cache/src/internal/cache.ts
 * Last Reviewed Date: 2025-09-10
 */

import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import { EnvMeta } from '../env.js'
import { ReserveCacheError, ValidationError } from './errors.js'
import * as utils from './internal/cacheUtils.js'
import { createTar, extractTar, listTar } from './internal/tar.js'
import { DownloadOptions, UploadOptions } from './options.js'

export const CACHE_STUBS = {
  restoreCache,
  saveCache
}

/**
 * Validates at least one path is provided.
 *
 * @param paths List of paths to check
 */
/* istanbul ignore next */
function checkPaths(paths: string[]): void {
  if (!paths || paths.length === 0)
    throw new ValidationError(
      `Path Validation Error: At least one directory or file path is required`
    )
}

/**
 * Validates the provided key is sufficient length and contains valid characters
 *
 * @param key Key to check
 */
/* istanbul ignore next */
function checkKey(key: string): void {
  if (key.length > 512)
    throw new ValidationError(
      `Key Validation Error: ${key} cannot be larger than 512 characters.`
    )

  const regex = /^[^,]*$/

  if (!regex.test(key))
    throw new ValidationError(
      `Key Validation Error: ${key} cannot contain commas.`
    )
}

/**
 * Restores cache from keys
 *
 * @param paths List of file paths to restore from the cache
 * @param primaryKey Explicit key for restoring the cache. Lookup is done with prefix matching.
 * @param restoreKeys Optional ordered list of keys to use for restoring the cache if no cache hit occurred for primaryKey
 * @param downloadOptions Cache download options
 * @param enableCrossOsArchive Optional boolean enabled to restore on Windows any cache created on any platform
 * @returns Key for the cache hit, otherwise undefined
 *
 * @remarks
 *
 * - Checks for required environment variables.
 * - Caches are only managed locally...removed check for service version.
 */
export async function restoreCache(
  paths: string[],
  primaryKey: string,
  restoreKeys?: string[],
  options?: DownloadOptions,
  enableCrossOsArchive = false
): Promise<string | undefined> {
  if (!process.env.LOCAL_ACTION_WORKSPACE)
    throw new Error(
      'LOCAL_ACTION_WORKSPACE must be set when interacting with @actions/cache!'
    )
  if (!process.env.LOCAL_ACTION_CACHE_PATH)
    throw new Error(
      'LOCAL_ACTION_CACHE_PATH must be set when interacting with @actions/cache!'
    )

  checkPaths(paths)

  return await restoreCacheFromFilesystem(
    paths,
    primaryKey,
    restoreKeys,
    options,
    enableCrossOsArchive
  )
}

/**
 * Restores cache from local filesystem
 *
 * @param paths List of file paths to restore from the cache
 * @param primaryKey Explicit key for restoring the cache. Lookup is done with prefix matching
 * @param restoreKeys Optional ordered list of keys to use for restoring the cache if no cache hit occurred for primaryKey
 * @param downloadOptions Cache download options
 * @param enableCrossOsArchive Optional boolean enabled to restore on Windows any cache created on any platform
 * @returns Key for the cache hit, otherwise undefined
 *
 * @remarks
 *
 * - Replaces v1 and v2 caching implementations.
 * - Download options, other than `lookupOnly`, are ignored.
 */
async function restoreCacheFromFilesystem(
  paths: string[],
  primaryKey: string,
  restoreKeys?: string[],
  options?: DownloadOptions,
  /* istanbul ignore next */
  enableCrossOsArchive = false
): Promise<string | undefined> {
  const keys = [primaryKey, ...(restoreKeys ?? [])]

  core.debug('Resolved Keys:')
  core.debug(JSON.stringify(keys))

  if (keys.length > 10)
    throw new ValidationError(
      `Key Validation Error: Keys are limited to a maximum of 10.`
    )

  for (const key of keys) checkKey(key)

  let archivePath = ''
  let matchedKey = undefined
  let matchedCache = undefined

  try {
    const compressionMethod = await utils.getCompressionMethod()
    const cacheVersion = utils.getCacheVersion(
      paths,
      compressionMethod,
      enableCrossOsArchive
    )

    const caches = fs
      .readdirSync(process.env.LOCAL_ACTION_CACHE_PATH!)
      .filter(file => file.endsWith('.cache'))
      .map(file => file.replace('.cache', ''))

    // Check the caches for a matching key
    for (const key of keys) {
      const cache = caches.find(c => c === key || c.startsWith(key))

      if (cache) {
        matchedKey = key
        matchedCache = cache
        break
      }
    }

    if (matchedCache === undefined) {
      core.debug(
        `Cache not found for version ${cacheVersion} of keys: ${keys.join(
          ', '
        )}`
      )

      return undefined
    }

    if (primaryKey !== matchedKey)
      core.info(`Cache hit for restore-key: ${matchedKey}`)
    else core.info(`Cache hit for: ${matchedKey}`)

    if (options?.lookupOnly) {
      core.info('Lookup only - skipping download')
      return matchedKey
    }

    archivePath = path.join(
      process.env.LOCAL_ACTION_CACHE_PATH!,
      `${matchedCache}.cache`
    )
    core.debug(`Archive path: ${archivePath}`)

    const archiveFileSize = utils.getArchiveFileSizeInBytes(archivePath)
    core.info(
      `Cache Size: ~${Math.round(
        archiveFileSize / (1024 * 1024)
      )} MB (${archiveFileSize} B)`
    )

    if (core.isDebug()) await listTar(archivePath, compressionMethod)
    await extractTar(archivePath, compressionMethod)

    core.info('Cache restored successfully')
    return matchedKey
  } catch (error: any) {
    core.warning(`Failed to restore: ${error.message}`)
  }

  return undefined
}

/**
 * Saves a list of files with the specified key
 *
 * @param paths List of file paths to be cached
 * @param key Explicit key for restoring the cache
 * @param enableCrossOsArchive Optional boolean enabled to save cache on Windows which could be restored on any platform
 * @param options Cache upload options
 * @returns Cache ID if the cache was saved successfully
 * @throws Error if save fails
 *
 * @remarks
 *
 * - Checks for required environment variables.
 * - Caches are only managed locally...removed check for service version.
 */
/* istanbul ignore next */
export async function saveCache(
  paths: string[],
  key: string,
  options?: UploadOptions,
  enableCrossOsArchive = false
): Promise<number> {
  if (!process.env.LOCAL_ACTION_WORKSPACE)
    throw new Error(
      'LOCAL_ACTION_WORKSPACE must be set when interacting with @actions/cache!'
    )
  if (!process.env.LOCAL_ACTION_CACHE_PATH)
    throw new Error(
      'LOCAL_ACTION_CACHE_PATH must be set when interacting with @actions/cache!'
    )

  checkPaths(paths)
  checkKey(key)

  return await saveCacheToFilesystem(paths, key, options, enableCrossOsArchive)
}

/**
 * Saves cache to local filesystem
 *
 * @param paths List of file paths to be cached
 * @param key Explicit key for restoring the cache
 * @param options Cache upload options
 * @param enableCrossOsArchive Optional boolean enabled to save cache on Windows which could be restored on any platform
 * @returns Cache ID if the cache was saved successfully
 *
 * @remarks
 *
 * - Replaces v1 and v2 caching implementations.
 * - Azure SDK settings and upload options are ignored.
 * - Cache reserving is replaced with file conflict checks.
 */
async function saveCacheToFilesystem(
  paths: string[],
  key: string,
  options?: UploadOptions,
  /* istanbul ignore next */
  enableCrossOsArchive = false
): Promise<number> {
  const compressionMethod = await utils.getCompressionMethod()
  const cachePaths = await utils.resolvePaths(paths)

  core.debug('Cache Paths:')
  core.debug(`${JSON.stringify(cachePaths)}`)

  if (cachePaths.length === 0)
    throw new Error(
      `Path Validation Error: Path(s) specified in the action for caching do(es) not exist, hence no cache is being saved.`
    )

  const archiveFolder = await utils.createTempDirectory()
  const archivePath = path.join(
    archiveFolder,
    utils.getCacheFileName(compressionMethod)
  )

  core.debug(`Archive Path: ${archivePath}`)

  try {
    await createTar(archiveFolder, cachePaths, compressionMethod)

    if (core.isDebug()) await listTar(archivePath, compressionMethod)

    const archiveSizeBytes = utils.getArchiveFileSizeInBytes(archivePath)
    core.debug(`File Size: ${archiveSizeBytes}`)

    // Attempt to reserve the cache. In local-action, this is done by checking
    // if there is an existing file with the same name. If so, we fail the save.
    core.debug('Reserving Cache')
    const version = utils.getCacheVersion(
      paths,
      compressionMethod,
      enableCrossOsArchive
    )

    if (
      fs.existsSync(
        path.join(
          process.env.LOCAL_ACTION_CACHE_PATH!,
          `${key}-${version}.cache`
        )
      )
    )
      throw new ReserveCacheError(
        `Unable to reserve cache with key ${key}, another job may be creating this cache.`
      )

    // Copy the archive to the cache folder. In local-action, this is simply
    // copying the file.
    core.debug(`Attempting to upload cache located at: ${archivePath}`)
    fs.copyFileSync(
      archivePath,
      path.join(process.env.LOCAL_ACTION_CACHE_PATH!, `${key}-${version}.cache`)
    )

    // Generate a cache ID. This can just be the next available ID based on
    // existing caches.
    return (
      Math.max(...Object.keys(EnvMeta.caches).map(key => parseInt(key))) + 1
    )
  } catch (error: any) {
    core.warning(`Failed to save: ${error.message}`)
  } finally {
    // Try to delete the original archive to save space
    try {
      await utils.unlinkFile(archivePath)
    } catch (error) {
      core.debug(`Failed to delete archive: ${error}`)
    }
  }

  return -1
}
