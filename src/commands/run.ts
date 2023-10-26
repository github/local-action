/**
 * Tests an action.yml locally
 */
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import proxyquire from 'proxyquire'
import YAML from 'yaml'

import { CoreMeta, CoreStubs } from '../stubs/core'
import { EnvMeta } from '../stubs/env'
import { printTitle } from '../utils/output'

export async function run(): Promise<void> {
  // eslint-disable-next-line github/no-then
  await import('chalk').then(mod => {
    const chalk = new mod.Chalk()

    /* c8 ignore start */
    CoreMeta.colors = {
      cyan: (message: string) => console.log(chalk.cyan(message)),
      blue: (message: string) => console.log(chalk.blue(message)),
      gray: (message: string) => console.log(chalk.gray(message)),
      green: (message: string) => console.log(chalk.green(message)),
      magenta: (message: string) => console.log(chalk.magenta(message)),
      red: (message: string) => console.log(chalk.red(message)),
      white: (message: string) => console.log(chalk.white(message)),
      yellow: (message: string) => console.log(chalk.yellow(message))
    }
    /* c8 ignore stop */

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
        Value: EnvMeta.envFile
      }
    ])
    console.log()

    // Load the environment file
    // TODO: Load this into EnvMeta directly? What about secrets...
    config({ path: path.resolve(process.cwd(), EnvMeta.envFile) })

    // Load step debug setting
    CoreMeta.stepDebug = process.env.ACTIONS_STEP_DEBUG === 'true'

    // Read the action.yml file and parse the expected inputs/outputs
    const action = YAML.parse(fs.readFileSync(EnvMeta.actionFile, 'utf8'))
    EnvMeta.inputs = action.inputs || {}
    EnvMeta.outputs = action.outputs || {}

    // Output the action metadata
    printTitle(CoreMeta.colors.blue, 'Action Metadata')
    console.log()
    console.table(
      /* c8 ignore start */
      Object.keys(EnvMeta.inputs).map(i => ({
        Input: i,
        Description: EnvMeta.inputs[i].description
      }))
      /* c8 ignore stop */
    )
    console.log()
    console.table(
      /* c8 ignore start */
      Object.keys(EnvMeta.outputs).map(i => ({
        Output: i,
        Description: EnvMeta.outputs[i].description
      }))
      /* c8 ignore stop */
    )
    console.log()

    // Back up the environment
    EnvMeta.envBackup = { ...process.env }
    EnvMeta.pathBackup = process.env.PATH

    printTitle(CoreMeta.colors.green, 'Running Action')

    // Stub the `@actions/toolkit` libraries and run the action
    /* c8 ignore start */
    proxyquire(path.resolve(EnvMeta.entrypoint).toString(), {
      '@actions/core': Object.assign(CoreStubs, { '@global': true })
    })
    /* c8 ignore stop */

    // Reset environment and PATH
    process.env = EnvMeta.envBackup
    process.env.PATH = EnvMeta.pathBackup
  })
}
