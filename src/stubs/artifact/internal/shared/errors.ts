/**
 * Last Reviewed Commit: 16b786a545a0b3a90e4dc4330af7225cf06f7e93
 * Last Reviewed Date: 2026-01-16
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
