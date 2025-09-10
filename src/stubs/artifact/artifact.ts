/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/f58042f9cc16bcaa87afaa86c2974a8c771ce1ea/packages/artifact/src/artifact.ts
 * Last Reviewed Date: 2025-09-10
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
