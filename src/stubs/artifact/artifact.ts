/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/artifact/src/artifact.ts
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
