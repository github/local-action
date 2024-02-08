import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import proxyquire from 'proxyquire'
import YAML from 'yaml'
import {
  CoreMeta,
  addPath,
  debug,
  endGroup,
  error,
  exportVariable,
  getBooleanInput,
  getIDToken,
  getInput,
  getMultilineInput,
  getState,
  group,
  info,
  isDebug,
  notice,
  saveState,
  setCommandEcho,
  setFailed,
  setOutput,
  setSecret,
  startGroup,
  warning
} from '../stubs/core-stubs'
import { EnvMeta } from '../stubs/env-stubs'
import type { Action } from '../types'
import { printTitle } from '../utils/output'

export async function action(): Promise<void> {
  const { Chalk } = await import('chalk')
  const chalk = new Chalk()

  // Back up the environment
  EnvMeta.envBackup = { ...process.env }
  EnvMeta.pathBackup = process.env.PATH

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actionYaml: Action = YAML.parse(
    fs.readFileSync(EnvMeta.actionFile, 'utf8')
  )
  EnvMeta.inputs = actionYaml.inputs || {}
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

  // Stub the `@actions/toolkit` libraries and run the action
  await proxyquire(path.resolve(EnvMeta.entrypoint).toString(), {
    '@actions/core': {
      '@global': true,
      addPath,
      debug,
      endGroup,
      error,
      exportVariable,
      getBooleanInput,
      getIDToken,
      getInput,
      getMultilineInput,
      getState,
      group,
      info,
      isDebug,
      notice,
      saveState,
      setCommandEcho,
      setFailed,
      setOutput,
      setSecret,
      startGroup,
      warning
    }
  })

  // Reset environment and PATH
  process.env = EnvMeta.envBackup
  process.env.PATH = EnvMeta.pathBackup
}
