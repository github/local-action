import * as core from '@actions/core'

export async function run(): Promise<void> {
  core.setFailed('This action failed!')
}
