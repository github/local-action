import * as core from '@actions/core'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { finished } from 'stream/promises'
import { EnvMeta } from '../../../../stubs/env.js'
import { FilesNotFoundError, InvalidResponseError } from '../shared/errors.js'
import type {
  Artifact,
  UploadArtifactOptions,
  UploadArtifactResponse
} from '../shared/interfaces.js'
import { validateArtifactName } from './path-and-artifact-name-validation.js'
import {
  type UploadZipSpecification,
  getUploadZipSpecification,
  validateRootDirectory
} from './upload-zip-specification.js'
import { createZipUploadStream } from './zip.js'

/**
 * @github/local-action Modified
 */
export async function uploadArtifact(
  name: string,
  files: string[],
  rootDirectory: string,
  options?: UploadArtifactOptions | undefined
): Promise<UploadArtifactResponse> {
  validateArtifactName(name)
  validateRootDirectory(rootDirectory)

  const zipSpecification: UploadZipSpecification[] = getUploadZipSpecification(
    files,
    rootDirectory
  )
  /* istanbul ignore next */
  if (zipSpecification.length === 0)
    throw new FilesNotFoundError(
      zipSpecification.flatMap(s => (s.sourcePath ? [s.sourcePath] : []))
    )

  // Multiple artifacts cannot have the same name.
  if (EnvMeta.artifacts.some(a => a.name === name))
    throw new Error(`An artifact with the name ${name} already exists`)

  // Only 10 artifacts can be created in a single job.
  if (EnvMeta.artifacts.length >= 10)
    throw new Error('Maximum number of artifacts (10) created')

  // Create the artifact metadata
  const artifact: Artifact = {
    name,
    id: EnvMeta.artifacts.length + 1,
    size: 0,
    createdAt: new Date()
  }

  const response: UploadArtifactResponse = {
    size: 0,
    id: artifact.id,
    digest: ''
  }

  const zipUploadStream = await createZipUploadStream(
    zipSpecification,
    options?.compressionLevel
  )

  const writeStream = fs.createWriteStream(
    path.join(process.env.LOCAL_ACTION_ARTIFACT_PATH!, `${artifact.name}.zip`)
  )
  const hashStream = crypto.createHash('sha256')

  /* istanbul ignore next */
  writeStream
    .on('error', error => {
      throw error
    })
    .on('finish', () => {
      try {
        core.info(`Finalizing artifact upload`)
        EnvMeta.artifacts.push(artifact)
        core.info(
          `Artifact ${artifact.name}.zip successfully finalized. Artifact ID ${artifact.id}`
        )

        response.size = artifact.size
        core.info(`Artifact ${artifact.name}.zip successfully written to disk`)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        core.debug(`Artifact creation failed: ${error}`)
        throw new InvalidResponseError(
          'CreateArtifact: response from backend was not ok'
        )
      }
    })

  /* istanbul ignore next */
  zipUploadStream
    .on('data', chunk => {
      artifact.size += chunk.length
    })
    .pipe(writeStream)
  zipUploadStream.pipe(hashStream).setEncoding('hex')

  await finished(writeStream)

  hashStream.end()
  response.digest = hashStream.read()

  return response
}
