import { getInput, info, setOutput } from '@actions/core'

export async function run(): Promise<void> {
  const myInput: string = getInput('myInput')

  setOutput('myOutput', myInput)

  info('TypeScript Action Succeeded!')
}
