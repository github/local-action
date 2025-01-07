/**
 * @github/local-action Unmodified
 */
export class FilesNotFoundError extends Error {
  files: string[]

  constructor(files: string[] = []) {
    let message = 'No files were found to upload'
    if (files.length > 0) {
      message += `: ${files.join(', ')}`
    }

    super(message)
    this.files = files
    this.name = 'FilesNotFoundError'
  }
}

/**
 * @github/local-action Unmodified
 */
export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidResponseError'
  }
}

/**
 * @github/local-action Unmodified
 */
export class ArtifactNotFoundError extends Error {
  constructor(message = 'Artifact not found') {
    super(message)
    this.name = 'ArtifactNotFoundError'
  }
}

/**
 * @github/local-action Unmodified
 */
export class GHESNotSupportedError extends Error {
  constructor(
    message = '@actions/artifact v2.0.0+, upload-artifact@v4+ and download-artifact@v4+ are not currently supported on GHES.'
  ) {
    super(message)
    this.name = 'GHESNotSupportedError'
  }
}
