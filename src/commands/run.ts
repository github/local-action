import { config } from 'dotenv'
import { createRequire } from 'module'
import quibble from 'quibble'
import { CORE_STUBS, CoreMeta } from '../stubs/core-stubs.js'
import { EnvMeta } from '../stubs/env-stubs.js'
import type { Action } from '../types.js'
import { printTitle } from '../utils/output.js'
import { isESM } from '../utils/package.js'

const require = createRequire(import.meta.url)

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

  // Get the node_modules path, starting with the entrypoint.
  const dirs = path.dirname(EnvMeta.entrypoint).split(path.sep)

  // Move up the directory tree until we find a node_modules directory.
  while (dirs.length > 0) {
    const nodeModulesPath = path.join(dirs.join(path.sep), 'node_modules')

    // Check if the current directory has a node_modules directory.
    try {
      if (
        fs.existsSync(nodeModulesPath) &&
        fs.lstatSync(nodeModulesPath).isDirectory()
      )
        break
    } catch {
      // Do nothing
    }

    // Move up the directory tree.
    dirs.pop()
  }

  /* istanbul ignore if */
  if (dirs.length === 0)
    throw new Error('Could not find node_modules directory')

  // Stub the `@actions/toolkit` libraries and run the action. Quibble and
  // local-action require a different approach depending on if the called action
  // is written in ESM.
  if (isESM()) {
    await quibble.esm(
      path.resolve(
        dirs.join(path.sep),
        'node_modules',
        '@actions',
        'core',
        'lib',
        'core.js'
      ),
      CORE_STUBS
    )

    // ESM actions need to be imported, not required.
    const { run } = await import(path.resolve(EnvMeta.entrypoint))

    // Check if the required path is a function.
    if (typeof run !== 'function')
      throw new Error(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )

    await run()
  } else {
    quibble(
      path.resolve(
        dirs.join(path.sep),
        'node_modules',
        '@actions',
        'core',
        'lib',
        'core.js'
      ),
      CORE_STUBS
    )

    // CJS actions need to be required, not imported.
    const { run } = require(path.resolve(EnvMeta.entrypoint))

    // Check if the required path is a function.
    if (typeof run !== 'function')
      throw new Error(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )

    await run()
  }
}
