/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/internal/upload/zip.ts
 */

import archiver from 'archiver'
import { realpath } from 'fs/promises'
import * as stream from 'stream'
import * as core from '../../../core/core.js'
import { getUploadChunkSize } from '../shared/config.js'
import type { UploadZipSpecification } from './upload-zip-specification.js'

/* istanbul ignore next */
export const DEFAULT_COMPRESSION_LEVEL = 6

// Custom stream transformer so we can set the highWaterMark property
// See https://github.com/nodejs/node/issues/8855
/* istanbul ignore next */
export class ZipUploadStream extends stream.Transform {
  constructor(bufferSize: number) {
    super({
      highWaterMark: bufferSize
    })
  }

  _transform(chunk: any, enc: any, cb: any): void {
    cb(null, chunk)
  }
}

/**
 * Creates a zip upload stream.
 *
 * @param uploadSpecification Upload Specification
 * @param compressionLevel Compression Level
 * @returns Zip Upload Stream
 */
/* istanbul ignore next */
export async function createZipUploadStream(
  uploadSpecification: UploadZipSpecification[],
  compressionLevel: number = DEFAULT_COMPRESSION_LEVEL
): Promise<ZipUploadStream> {
  core.debug(
    `Creating Artifact archive with compressionLevel: ${compressionLevel}`
  )

  const zip = archiver.create('zip', {
    highWaterMark: getUploadChunkSize(),
    zlib: { level: compressionLevel }
  })

  // register callbacks for various events during the zip lifecycle
  zip.on('error', zipErrorCallback)
  zip.on('warning', zipWarningCallback)
  zip.on('finish', zipFinishCallback)
  zip.on('end', zipEndCallback)

  for (const file of uploadSpecification) {
    if (file.sourcePath !== null) {
      // Check if symlink and resolve the source path
      let sourcePath = file.sourcePath
      if (file.stats.isSymbolicLink())
        sourcePath = await realpath(file.sourcePath)

      // Add the file to the zip
      zip.file(sourcePath, {
        name: file.destinationPath
      })
    } else {
      // Add a directory to the zip
      zip.append('', { name: file.destinationPath })
    }
  }

  const bufferSize = getUploadChunkSize()
  const zipUploadStream = new ZipUploadStream(bufferSize)

  core.debug(
    `Zip write high watermark value ${zipUploadStream.writableHighWaterMark}`
  )
  core.debug(
    `Zip read high watermark value ${zipUploadStream.readableHighWaterMark}`
  )

  zip.pipe(zipUploadStream)
  zip.finalize()

  return zipUploadStream
}

/* istanbul ignore next */
const zipErrorCallback = (error: any): void => {
  core.error('An error has occurred while creating the zip file for upload')
  core.info(error)

  throw new Error('An error has occurred during zip creation for the artifact')
}

/* istanbul ignore next */
const zipWarningCallback = (error: any): void => {
  if (error.code === 'ENOENT') {
    core.warning(
      'ENOENT warning during artifact zip creation. No such file or directory'
    )
    core.info(error)
  } else {
    core.warning(
      `A non-blocking warning has occurred during artifact zip creation: ${error.code}`
    )
    core.info(error)
  }
}

/* istanbul ignore next */
const zipFinishCallback = (): void => {
  core.debug('Zip stream for upload has finished.')
}

/* istanbul ignore next */
const zipEndCallback = (): void => {
  core.debug('Zip stream for upload has ended.')
}
