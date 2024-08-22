import { config } from 'dotenv'
import quibble from 'quibble'
import { CORE_STUBS, CoreMeta } from '../stubs/core-stubs.js'
import { EnvMeta } from '../stubs/env-stubs.js'
import type { Action } from '../types.js'
import { printTitle } from '../utils/output.js'
import { isESM } from '../utils/package.js'

export async function action(): Promise<void> {
  const { Chalk } = await import('chalk')
  const chalk = new Chalk()
  const fs = await import('fs')
  const path = await import('path')
  const YAML = await import('yaml')

  CoreMeta.colors = {
    cyan: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.cyan(msg)),
    blue: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.blue(msg)),
    gray: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.gray(msg)),
    green: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.green(msg)),
    magenta: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.magenta(msg)),
    red: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.red(msg)),
    white: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.white(msg)),
    yellow: /* istanbul ignore next */ (msg: string) =>
      console.log(chalk.yellow(msg))
  }

  // Output the configuration
  printTitle(CoreMeta.colors.cyan, 'Configuration')
  console.log()
  console.table([
    {
      Field: 'Action Path',
      Value: EnvMeta.actionPath
    },
    {
      Field: 'Entrypoint',
      Value: EnvMeta.entrypoint
    },
    {
      Field: 'Environment File',
      Value: EnvMeta.dotenvFile
    }
  ])
  console.log()

  // Load the environment file
  // @todo Load this into EnvMeta directly? What about secrets...
  config({ path: path.resolve(process.cwd(), EnvMeta.dotenvFile) })

  // Load action settings
  CoreMeta.stepDebug = process.env.ACTIONS_STEP_DEBUG === 'true'
  /* istanbul ignore next */
  CoreMeta.stepSummaryPath = process.env.GITHUB_STEP_SUMMARY ?? ''

  // Read the action.yml file and parse the expected inputs/outputs
  const actionYaml: Action = YAML.parse(
    fs.readFileSync(EnvMeta.actionFile, { encoding: 'utf8', flag: 'r' })
  ) as Action

  /* istanbul ignore next */
  EnvMeta.inputs = actionYaml.inputs || {}
  /* istanbul ignore next */
  EnvMeta.outputs = actionYaml.outputs || {}

  // Output the action metadata
  printTitle(CoreMeta.colors.blue, 'Action Metadata')
  console.log()
  console.table(
    Object.keys(EnvMeta.inputs).map(i => ({
      Input: i,
      Description: EnvMeta.inputs[i].description
    }))
  )
  console.log()
  console.table(
    Object.keys(EnvMeta.outputs).map(i => ({
      Output: i,
      Description: EnvMeta.outputs[i].description
    }))
  )
  console.log()

  printTitle(CoreMeta.colors.green, 'Running Action')

  // Stub the `@actions/toolkit` libraries and run the action. Quibble requires
  // a different approach depending on if this is an ESM action.
  if (isESM()) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await quibble.esm(
      `${path.resolve(EnvMeta.actionPath)}/node_modules/@actions/core/lib/core.js`,
      CORE_STUBS
    )
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    quibble(
      `${path.resolve(EnvMeta.actionPath)}/node_modules/@actions/core`,
      CORE_STUBS
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { run } = await import(path.resolve(EnvMeta.entrypoint))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await run()
}
