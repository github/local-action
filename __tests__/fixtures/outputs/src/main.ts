import * as core from '@actions/core'

export async function run(): Promise<void> {
  core.setOutput('my-output', 'my-value')
}
