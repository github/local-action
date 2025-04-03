/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/internal/upload/path-and-artifact-name-validation.ts
 */

import { info } from '../../../core/core.js'

/**
 * Invalid characters that cannot be in the artifact name or an uploaded file.
 * Will be rejected from the server if attempted to be sent over. These
 * characters are not allowed due to limitations with certain file systems such
 * as NTFS. To maintain platform-agnostic behavior, all characters that are not
 * supported by an individual filesystem/platform will not be supported on all
 * fileSystems/platforms
 *
 * FilePaths can include characters such as \ and / which are not permitted in
 * the artifact name alone
 */
/* istanbul ignore next */
const invalidArtifactFilePathCharacters = new Map<string, string>([
  ['"', ' Double quote "'],
  [':', ' Colon :'],
  ['<', ' Less than <'],
  ['>', ' Greater than >'],
  ['|', ' Vertical bar |'],
  ['*', ' Asterisk *'],
  ['?', ' Question mark ?'],
  ['\r', ' Carriage return \\r'],
  ['\n', ' Line feed \\n']
])

/* istanbul ignore next */
const invalidArtifactNameCharacters = new Map<string, string>([
  ...invalidArtifactFilePathCharacters,
  ['\\', ' Backslash \\'],
  ['/', ' Forward slash /']
])

/**
 * Validates the name of the artifact
 *
 * @param name Artifact Name
 */
export function validateArtifactName(name: string): void {
  if (!name)
    throw new Error(`Provided artifact name input during validation is empty`)

  for (const [
    invalidCharacterKey,
    errorMessageForCharacter
  ] of invalidArtifactNameCharacters) {
    if (name.includes(invalidCharacterKey))
      throw new Error(
        `The artifact name is not valid: ${name}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(
          invalidArtifactNameCharacters.values()
        ).toString()}
          
These characters are not allowed in the artifact name due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.`
      )
  }

  info(`Artifact name is valid!`)
}

/**
 * Validates file paths
 *
 * @param path File Path
 */
export function validateFilePath(path: string): void {
  if (!path)
    throw new Error(`Provided file path input during validation is empty`)

  for (const [
    invalidCharacterKey,
    errorMessageForCharacter
  ] of invalidArtifactFilePathCharacters) {
    if (path.includes(invalidCharacterKey))
      throw new Error(
        `The path for one of the files in artifact is not valid: ${path}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(
          invalidArtifactFilePathCharacters.values()
        ).toString()}
          
The following characters are not allowed in files that are uploaded due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.
          `
      )
  }
}
