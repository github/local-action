import { jest } from '@jest/globals'
import { Endpoints } from '@octokit/types'

export const graphql = jest.fn()
export const paginate = jest.fn()
export const request = jest.fn()
export const rest = {
  actions: {
    deleteArtifact:
      jest.fn<
        () => Endpoints['DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}']['response']
      >(),
    listWorkflowRunArtifacts:
      jest.fn<
        () => Endpoints['GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts']['response']
      >()
  }
}
