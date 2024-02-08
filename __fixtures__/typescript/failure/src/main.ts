import * as core from '@actions/core'

// eslint-disable-next-line @typescript-eslint/require-await
export async function run(): Promise<void> {
  core.setFailed('TypeScript Action Failed!')
}
