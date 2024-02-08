import * as core from '@actions/core'

// eslint-disable-next-line @typescript-eslint/require-await
export async function run(): Promise<void> {
  const myInput: string = core.getInput('myInput')
  core.setOutput('myOutput', myInput)
  core.info('TypeScript Action Succeeded!')
}
