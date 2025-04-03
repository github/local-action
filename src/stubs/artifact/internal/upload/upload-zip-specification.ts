/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/internal/upload/upload-zip-specification.ts
 */

import * as fs from 'fs'
import { normalize, resolve } from 'path'
import * as core from '../../../core/core.js'
import { validateFilePath } from './path-and-artifact-name-validation.js'

export interface UploadZipSpecification {
  /**
   * An absolute source path that points to a file that will be added to a zip.
   * Null if creating a new directory
   */
  sourcePath: string | null

  /**
   * The destination path in a zip for a file
   */
  destinationPath: string

  /**
   * Information about the file
   *
   * https://nodejs.org/api/fs.html#class-fsstats
   */
  stats: fs.Stats
}

/**
 * Checks if a root directory exists and is valid.
 *
 * @param rootDirectory Root Directory
 */
export function validateRootDirectory(rootDirectory: string): void {
  if (!fs.existsSync(rootDirectory))
    throw new Error(
      `The provided rootDirectory ${rootDirectory} does not exist`
    )

  if (!fs.statSync(rootDirectory).isDirectory())
    throw new Error(
      `The provided rootDirectory ${rootDirectory} is not a valid directory`
    )

  core.info(`Root directory input is valid!`)
}

/**
 * Creates a specification that describes how a zip file will be created for a
 * set of input files.
 *
 * @param filesToZip Files to Zip
 * @param rootDirectory Root Directory
 * @returns Upload Zip Specification
 */
/* istanbul ignore next */
export function getUploadZipSpecification(
  filesToZip: string[],
  rootDirectory: string
): UploadZipSpecification[] {
  const specification: UploadZipSpecification[] = []

  // Normalize and resolve, this allows for either absolute or relative paths to
  // be used
  rootDirectory = normalize(rootDirectory)
  rootDirectory = resolve(rootDirectory)

  for (let file of filesToZip) {
    const stats = fs.lstatSync(file, { throwIfNoEntry: false })
    if (!stats) throw new Error(`File ${file} does not exist`)

    if (!stats.isDirectory()) {
      // Normalize and resolve, this allows for either absolute or relative
      // paths to be used
      file = normalize(file)
      file = resolve(file)

      if (!file.startsWith(rootDirectory))
        throw new Error(
          `The rootDirectory: ${rootDirectory} is not a parent directory of the file: ${file}`
        )

      // Check for forbidden characters in file paths that may cause ambiguous
      // behavior if downloaded on different file systems
      const uploadPath = file.replace(rootDirectory, '')
      validateFilePath(uploadPath)

      specification.push({
        sourcePath: file,
        destinationPath: uploadPath,
        stats
      })
    } else {
      // Empty directory
      const directoryPath = file.replace(rootDirectory, '')
      validateFilePath(directoryPath)

      specification.push({
        sourcePath: null,
        destinationPath: directoryPath,
        stats
      })
    }
  }
  return specification
}
