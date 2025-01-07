/**
 * @github/local-action Modified
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
