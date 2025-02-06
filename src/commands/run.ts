import { config } from 'dotenv'
import { createRequire } from 'module'
import quibble from 'quibble'
import { ARTIFACT_STUBS } from '../stubs/artifact/artifact.js'
import { CORE_STUBS, CoreMeta } from '../stubs/core/core.js'
import { EnvMeta } from '../stubs/env.js'
import { Context } from '../stubs/github/context.js'
import { getOctokit } from '../stubs/github/github.ts'
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

  // The entrypoint is OS-specific. On Windows, it has to start with a leading
  // slash, then the drive letter, followed by the rest of the path. In both
  // cases, the path separators are converted to forward slashes.
  /* istanbul ignore next */
  const osEntrypoint =
    process.platform !== 'win32'
      ? path.resolve(EnvMeta.entrypoint)
      : '/' + path.resolve(EnvMeta.entrypoint.replaceAll(path.sep, '/'))

  // Stub the `@actions/toolkit` libraries and run the action. Quibble and
  // local-action require a different approach depending on if the called action
  // is written in ESM.
  if (isESM()) {
    await quibble.esm(
      path.resolve(
        dirs.join(path.sep),
        'node_modules',
        '@actions',
        'github',
        'lib',
        'github.js'
      ),
      {
        getOctokit,
        // The context object needs to be created **after** the dotenv file is
        // loaded. Otherwise, the GITHUB_* environment variables will not be
        // available to the action.
        context: new Context()
      }
    )
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
    await quibble.esm(
      path.resolve(
        dirs.join(path.sep),
        'node_modules',
        '@actions',
        'artifact',
        'lib',
        'artifact.js'
      ),
      ARTIFACT_STUBS
    )

    // ESM actions need to be imported, not required.
    const { run } = await import(osEntrypoint)

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
        'github',
        'lib',
        'github.js'
      ),
      {
        getOctokit,
        // The context object needs to be created **after** the dotenv file is
        // loaded. Otherwise, the GITHUB_* environment variables will not be
        // available to the action.
        context: new Context()
      }
    )
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
    quibble(
      path.resolve(
        dirs.join(path.sep),
        'node_modules',
        '@actions',
        'artifact',
        'lib',
        'artifact.js'
      ),
      ARTIFACT_STUBS
    )

    // CJS actions need to be required, not imported.
    const { run } = require(osEntrypoint)

    // Check if the required path is a function.
    if (typeof run !== 'function')
      throw new Error(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )

    await run()
  }
}
