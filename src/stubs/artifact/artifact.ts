/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/ee91adfbc4f4d1470e176a8d568c0cbdabaf98e0/packages/artifact/src/artifact.ts
 * Last Reviewed Date: 2026-01-16
 */

import {
  type ArtifactClient,
  DefaultArtifactClient
} from './internal/client.js'

const client: ArtifactClient = new DefaultArtifactClient()
export default client

export const ARTIFACT_STUBS = {
  DefaultArtifactClient,
  client
}
