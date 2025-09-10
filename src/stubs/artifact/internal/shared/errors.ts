/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/internal/shared/errors.ts
 * Last Reviewed Date: 2025-09-10
 */

/**
 * Files Not Found Error
 */
export class FilesNotFoundError extends Error {
  files: string[]

  constructor(files: string[] = []) {
    let message = 'No files were found to upload'

    if (files.length > 0) message += `: ${files.join(', ')}`

    super(message)
    this.files = files
    this.name = 'FilesNotFoundError'
  }
}

/**
 * Invalid Response Error
 */
export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidResponseError'
  }
}

/**
 * Artifact Not Found Error
 */
export class ArtifactNotFoundError extends Error {
  constructor(message = 'Artifact not found') {
    super(message)
    this.name = 'ArtifactNotFoundError'
  }
}

/**
 * GHES Not Supported Error
 */
export class GHESNotSupportedError extends Error {
  constructor(
    message = '@actions/artifact v2.0.0+, upload-artifact@v4+ and download-artifact@v4+ are not currently supported on GHES.'
  ) {
    super(message)
    this.name = 'GHESNotSupportedError'
  }
}
