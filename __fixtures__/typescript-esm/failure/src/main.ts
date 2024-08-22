import { setFailed } from '@actions/core'

export async function run(): Promise<void> {
  setFailed('TypeScript ESM Action Failed!')
}
