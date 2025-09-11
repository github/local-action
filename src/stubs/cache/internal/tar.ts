/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/main/packages/cache/src/internal/tar.ts
 * Last Reviewed Date: 2025-09-10
 */

import { exec } from '@actions/exec'
import * as io from '@actions/io'
import { existsSync, writeFileSync } from 'fs'
import * as path from 'path'
import { ArchiveTool } from '../interfaces.js'
import * as utils from './cacheUtils.js'
import {
  ArchiveToolType,
  CompressionMethod,
  ManifestFilename,
  SystemTarPathOnWindows,
  TarFilename
} from './constants.js'

const IS_WINDOWS = process.platform === 'win32'

/**
 * Returns tar path and type: BSD or GNU
 *
 * @returns Path and type of tar
 */
/* istanbul ignore next */
async function getTarPath(): Promise<ArchiveTool> {
  switch (process.platform) {
    case 'win32': {
      const gnuTar = await utils.getGnuTarPathOnWindows()
      const systemTar = SystemTarPathOnWindows
      if (gnuTar) {
        // Use GNUtar as default on windows
        return <ArchiveTool>{ path: gnuTar, type: ArchiveToolType.GNU }
      } else if (existsSync(systemTar)) {
        return <ArchiveTool>{ path: systemTar, type: ArchiveToolType.BSD }
      }
      break
    }
    case 'darwin': {
      const gnuTar = await io.which('gtar', false)
      if (gnuTar) {
        // fix permission denied errors when extracting BSD tar archive with GNU tar - https://github.com/actions/cache/issues/527
        return <ArchiveTool>{ path: gnuTar, type: ArchiveToolType.GNU }
      } else {
        return <ArchiveTool>{
          path: await io.which('tar', true),
          type: ArchiveToolType.BSD
        }
      }
    }
    default:
      break
  }
  // Default assumption is GNU tar is present in path
  return <ArchiveTool>{
    path: await io.which('tar', true),
    type: ArchiveToolType.GNU
  }
}

/**
 * Return arguments for tar as per tarPath, compressionMethod, method type and os
 *
 * @param tarPath Path and type of tar
 * @param compressionMethod Compression method
 * @param type Type of operation: create, extract, list
 * @param archivePath Archive path for extract and list operations
 * @returns List of arguments for tar command
 *
 * @remarks
 *
 * - Made archivePath required for create operation
 * - Removed exclude statement for creation since it happens in a different path
 */
async function getTarArgs(
  tarPath: ArchiveTool,
  compressionMethod: CompressionMethod,
  type: string,
  archivePath: string
): Promise<string[]> {
  const args = [`"${tarPath.path}"`]
  const cacheFileName = utils.getCacheFileName(compressionMethod)
  const tarFile = 'cache.tar'
  const workingDirectory = getWorkingDirectory()

  // Speficic args for BSD tar on windows for workaround
  /* istanbul ignore next */
  const BSD_TAR_ZSTD =
    tarPath.type === ArchiveToolType.BSD &&
    compressionMethod !== CompressionMethod.Gzip &&
    IS_WINDOWS

  // Method specific args
  switch (type) {
    case 'create':
      args.push(
        '--posix',
        '-cf',
        /* istanbul ignore next */
        BSD_TAR_ZSTD
          ? tarFile
          : path
              .join(archivePath, cacheFileName)
              .replace(new RegExp(`\\${path.sep}`, 'g'), '/'),
        '-P',
        '-C',
        workingDirectory.replace(new RegExp(`\\${path.sep}`, 'g'), '/'),
        '--files-from',
        path.join(process.env.LOCAL_ACTION_WORKSPACE!, ManifestFilename)
      )
      break
    case 'extract':
      args.push(
        '-xf',
        /* istanbul ignore next */
        BSD_TAR_ZSTD
          ? tarFile
          : archivePath.replace(new RegExp(`\\${path.sep}`, 'g'), '/'),
        '-P',
        '-C',
        workingDirectory.replace(new RegExp(`\\${path.sep}`, 'g'), '/')
      )
      break
    case 'list':
      args.push(
        '-tf',
        /* istanbul ignore next */
        BSD_TAR_ZSTD
          ? tarFile
          : archivePath.replace(new RegExp(`\\${path.sep}`, 'g'), '/'),
        '-P'
      )
      break
  }

  // Platform specific args
  /* istanbul ignore next */
  if (tarPath.type === ArchiveToolType.GNU) {
    switch (process.platform) {
      case 'win32':
        args.push('--force-local')
        break
      case 'darwin':
        args.push('--delay-directory-restore')
        break
    }
  }

  return args
}

/**
 * Returns commands to run TAR and compression program
 *
 * @param compressionMethod Compression method
 * @param type Type of operation: create, extract, list
 * @param archivePath Archive path for create, extract, and list operations
 * @returns List of commands to run
 */
/* istanbul ignore next */
async function getCommands(
  compressionMethod: CompressionMethod,
  type: string,
  archivePath = ''
): Promise<string[]> {
  let args

  const tarPath = await getTarPath()
  const tarArgs = await getTarArgs(
    tarPath,
    compressionMethod,
    type,
    archivePath
  )

  const compressionArgs =
    type !== 'create'
      ? await getDecompressionProgram(tarPath, compressionMethod, archivePath)
      : await getCompressionProgram(tarPath, compressionMethod)

  const BSD_TAR_ZSTD =
    tarPath.type === ArchiveToolType.BSD &&
    compressionMethod !== CompressionMethod.Gzip &&
    IS_WINDOWS

  if (BSD_TAR_ZSTD && type !== 'create')
    args = [[...compressionArgs].join(' '), [...tarArgs].join(' ')]
  else args = [[...tarArgs].join(' '), [...compressionArgs].join(' ')]

  if (BSD_TAR_ZSTD) return args

  return [args.join(' ')]
}

/**
 * Gets the working directory (local or GitHub Actions)
 *
 * @returns Working directory
 */
/* istanbul ignore next */
function getWorkingDirectory(): string {
  return process.env.GITHUB_WORKSPACE ?? process.cwd()
}

/**
 * Common function for extractTar and listTar to get the compression method
 *
 * @param tarPath Path and type of tar
 * @param compressionMethod Compression method
 * @param archivePath Archive path for extract and list operations
 * @returns List of arguments for decompression program
 */
/* istanbul ignore next */
async function getDecompressionProgram(
  tarPath: ArchiveTool,
  compressionMethod: CompressionMethod,
  archivePath: string
): Promise<string[]> {
  // -d: Decompress.
  // unzstd is equivalent to 'zstd -d'
  // --long=#: Enables long distance matching with # bits. Maximum is 30 (1GB) on 32-bit OS and 31 (2GB) on 64-bit.
  // Using 30 here because we also support 32-bit self-hosted runners.
  const BSD_TAR_ZSTD =
    tarPath.type === ArchiveToolType.BSD &&
    compressionMethod !== CompressionMethod.Gzip &&
    IS_WINDOWS
  switch (compressionMethod) {
    case CompressionMethod.Zstd:
      return BSD_TAR_ZSTD
        ? [
            'zstd -d --long=30 --force -o',
            TarFilename,
            archivePath.replace(new RegExp(`\\${path.sep}`, 'g'), '/')
          ]
        : [
            '--use-compress-program',
            IS_WINDOWS ? '"zstd -d --long=30"' : 'unzstd --long=30'
          ]
    case CompressionMethod.ZstdWithoutLong:
      return BSD_TAR_ZSTD
        ? [
            'zstd -d --force -o',
            TarFilename,
            archivePath.replace(new RegExp(`\\${path.sep}`, 'g'), '/')
          ]
        : ['--use-compress-program', IS_WINDOWS ? '"zstd -d"' : 'unzstd']
    default:
      return ['-z']
  }
}

/**
 * Used for creating the archive
 *
 * -T#: Compress using # working thread. If # is 0, attempt to detect and use the number of physical CPU cores.
 * zstdmt is equivalent to 'zstd -T0'
 * --long=#: Enables long distance matching with # bits. Maximum is 30 (1GB) on 32-bit OS and 31 (2GB) on 64-bit.
 * Using 30 here because we also support 32-bit self-hosted runners.
 * Long range mode is added to zstd in v1.3.2 release, so we will not use --long in older version of zstd.
 */
/* istanbul ignore next */
async function getCompressionProgram(
  tarPath: ArchiveTool,
  compressionMethod: CompressionMethod
): Promise<string[]> {
  const cacheFileName = utils.getCacheFileName(compressionMethod)
  const BSD_TAR_ZSTD =
    tarPath.type === ArchiveToolType.BSD &&
    compressionMethod !== CompressionMethod.Gzip &&
    IS_WINDOWS
  switch (compressionMethod) {
    case CompressionMethod.Zstd:
      return BSD_TAR_ZSTD
        ? [
            'zstd -T0 --long=30 --force -o',
            cacheFileName.replace(new RegExp(`\\${path.sep}`, 'g'), '/'),
            TarFilename
          ]
        : [
            '--use-compress-program',
            IS_WINDOWS ? '"zstd -T0 --long=30"' : 'zstdmt --long=30'
          ]
    case CompressionMethod.ZstdWithoutLong:
      return BSD_TAR_ZSTD
        ? [
            'zstd -T0 --force -o',
            cacheFileName.replace(new RegExp(`\\${path.sep}`, 'g'), '/'),
            TarFilename
          ]
        : ['--use-compress-program', IS_WINDOWS ? '"zstd -T0"' : 'zstdmt']
    default:
      return ['-z']
  }
}

/**
 * Executes all commands as separate processes
 *
 * @param commands List of commands to execute
 * @param cwd Optional current working directory for the commands
 */
/* istanbul ignore next */
async function execCommands(commands: string[], cwd?: string): Promise<void> {
  for (const command of commands) {
    try {
      await exec(command, undefined, {
        cwd,
        env: { ...(process.env as object), MSYS: 'winsymlinks:nativestrict' }
      })
    } catch (error: any) {
      throw new Error(
        `${command.split(' ')[0]} failed with error: ${error?.message}`
      )
    }
  }
}

/**
 * List the contents of a tar
 *
 * @param archivePath Path to the archive to list
 * @param compressionMethod Compression method to use
 */
/* istanbul ignore next */
export async function listTar(
  archivePath: string,
  compressionMethod: CompressionMethod
): Promise<void> {
  const commands = await getCommands(compressionMethod, 'list', archivePath)
  await execCommands(commands)
}

/**
 * Extracts a TAR
 *
 * @param archivePath Path to the archive to extract
 * @param compressionMethod Compression method to use
 */
/* istanbul ignore next */
export async function extractTar(
  archivePath: string,
  compressionMethod: CompressionMethod
): Promise<void> {
  // Create directory to extract tar into
  const workingDirectory = getWorkingDirectory()
  await io.mkdirP(workingDirectory)
  const commands = await getCommands(compressionMethod, 'extract', archivePath)
  await execCommands(commands)
}

/**
 * Creates a TAR archive from a list of directories
 *
 * @param archiveFolder The folder where the archive will be created
 * @param sourceDirectories List of directories to include in the archive
 * @param compressionMethod Compression method to use
 */
/* istanbul ignore next */
export async function createTar(
  archiveFolder: string,
  sourceDirectories: string[],
  compressionMethod: CompressionMethod
): Promise<void> {
  // Write source directories to manifest.txt to avoid command length limits
  writeFileSync(
    path.join(process.env.LOCAL_ACTION_WORKSPACE!, ManifestFilename),
    sourceDirectories.join('\n')
  )
  const commands = await getCommands(compressionMethod, 'create', archiveFolder)
  await execCommands(commands, archiveFolder)
}
