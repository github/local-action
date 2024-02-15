/* eslint-disable @typescript-eslint/require-await */

import { setFailed } from '@actions/core'

export async function run(): Promise<void> {
  setFailed('TypeScript Action Failed!')
}
