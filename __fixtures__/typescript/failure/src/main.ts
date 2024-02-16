import { setFailed, summary } from '@actions/core'

export async function run(): Promise<void> {
  summary.addRaw('TypeScript Action Failed!')
  await summary.write()

  setFailed('TypeScript Action Failed!')
}
