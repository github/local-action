import { getInput, info, setOutput, summary } from '@actions/core'

export async function run(): Promise<void> {
  const myInput: string = getInput('myInput')

  setOutput('myOutput', myInput)

  summary.addRaw('TypeScript Action Succeeded!')
  await summary.write()

  info('TypeScript Action Succeeded!')
}
