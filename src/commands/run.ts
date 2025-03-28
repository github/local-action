import { config } from 'dotenv'
import { createRequire } from 'module'
import { execSync } from 'node:child_process'
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
let needsReplug: boolean = false

export async function action(): Promise<void> {
  const { Chalk } = await import('chalk')
  const chalk = new Chalk()
  const fs = await import('fs')
  const path = await import('path')
  const YAML = await import('yaml')

  CoreMeta.colors = {
    cyan: (msg: string) => console.log(chalk.cyan(msg)),
    blue: (msg: string) => console.log(chalk.blue(msg)),
    gray: (msg: string) => console.log(chalk.gray(msg)),
    green: (msg: string) => console.log(chalk.green(msg)),
    magenta: (msg: string) => console.log(chalk.magenta(msg)),
    red: (msg: string) => console.log(chalk.red(msg)),
    white: (msg: string) => console.log(chalk.white(msg)),
    yellow: (msg: string) => console.log(chalk.yellow(msg))
  }

  const actionType = isESM() ? 'esm' : 'cjs'

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
  config({
    path: path.resolve(process.cwd(), EnvMeta.dotenvFile),
    override: true
  })

  // Load action settings
  CoreMeta.stepDebug = process.env.ACTIONS_STEP_DEBUG === 'true'
  CoreMeta.stepSummaryPath = process.env.GITHUB_STEP_SUMMARY ?? ''

  // Read the action.yml file and parse the expected inputs/outputs
  const actionYaml: Action = YAML.parse(
    fs.readFileSync(EnvMeta.actionFile, { encoding: 'utf8', flag: 'r' })
  ) as Action

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

  // Defining the stubs. Next, we will load their paths based on the package
  // manager in use.
  const stubs = {
    '@actions/artifact': {
      base: undefined as string | undefined,
      lib: ['lib', 'artifact.js'],
      stubs: ARTIFACT_STUBS
    },
    '@actions/core': {
      base: undefined as string | undefined,
      lib: ['lib', 'core.js'],
      stubs: CORE_STUBS
    },
    '@actions/github': {
      base: undefined as string | undefined,
      lib: ['lib', 'github.js'],
      stubs: {
        getOctokit,
        // The context object needs to be created **after** the dotenv file is
        // loaded. Otherwise, the GITHUB_* environment variables will not be
        // available to the action.
        context: new Context()
      }
    }
  }

  // Starting at the target action's entrypoint, find the package.json file.
  const dirs = path.dirname(EnvMeta.entrypoint).split(path.sep)
  let packageJsonPath
  let found = false

  // Move up the directory tree until we find a package.json directory.
  while (dirs.length > 0) {
    packageJsonPath = path.resolve(dirs.join(path.sep), 'package.json')

    // Check if the current directory has a package.json file.
    if (fs.existsSync(packageJsonPath)) {
      found = true
      break
    }

    // Move up the directory tree.
    dirs.pop()
  }

  if (!found || !packageJsonPath)
    throw new Error(
      'No package.json file found in the action directory or any parent directories.'
    )

  // If the package manager is `npm`, we can assume there is a `node_modules`
  // directory somewhere in the project.
  //
  // Actions that use `pnpm` will also have a `node_modules` directory, however
  // in testing it seems that the `node_modules/@actions/<pkg>` dependency can
  // only be properly stubbed for CJS actions. For ESM actions, this should
  // instead point to the pnpm cache.
  //
  // If the package manager is `yarn`, then we need to first check for
  // `node_modules` (for non-PnP versions), or we can try unplugging the
  // dependencies from the yarn cache.
  if (
    process.env.NODE_PACKAGE_MANAGER === 'npm' ||
    (process.env.NODE_PACKAGE_MANAGER === 'pnpm' && actionType === 'cjs') ||
    (process.env.NODE_PACKAGE_MANAGER === 'yarn' &&
      fs.existsSync(path.join(EnvMeta.actionPath, 'node_modules')))
  ) {
    /**
     * Get the path in the npm cache for each package.
     * `npm ls <package> --json --long`
     *
     * Example Output
     *
     * {
     *   "path": "<workspace>/typescript-action",
     *   "_dependencies": {
     *     "@actions/core": "^1.11.1",
     *     "@actions/github": "^6.0.0"
     *   },
     *   "dependencies": {
     *     "@actions/core": {
     *       "path": "<workspace>/typescript-action/node_modules/@actions/core",
     *     },
     *     "@actions/github": {
     *       "path": "<workspace>/typescript-action/node_modules/@actions/github",
     *     }
     *   }
     * }
     */

    const npmList = JSON.parse(
      execSync(
        `npm ls ${Object.keys(stubs).join(' ')} --json --long`
      ).toString()
    ) as {
      path: string
      dependencies?: {
        [key: string]: { path: string }
      }
    }

    if (Object.keys(npmList.dependencies ?? {}).length === 0)
      throw new Error('Something went wrong with npm list')

    Object.keys(stubs).forEach(key => {
      stubs[key as keyof typeof stubs].base = npmList.dependencies?.[key]?.path
    })
  } else if (
    process.env.NODE_PACKAGE_MANAGER === 'pnpm' &&
    actionType === 'esm'
  ) {
    /**
     * Get the path in the pnpm cache for each package.
     * `pnpm list <package> --json`
     *
     * Example Output
     *
     * [
     *   {
     *     "path": "<workspace>/typescript-action",
     *     "dependencies": {
     *       "@actions/core": {
     *         "path": "<workspace>/typescript-action/node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core"
     *       },
     *       "@actions/github": {
     *         "path": "<workspace>/typescript-action/node_modules/.pnpm/@actions+github@6.0.0/node_modules/@actions/github"
     *       }
     *     }
     *   }
     * ]
     */
    const pnpmList = JSON.parse(
      execSync(`pnpm list ${Object.keys(stubs).join(' ')} --json`).toString()
    ) as {
      path: string
      dependencies?: {
        [key: string]: { path: string }
      }
    }[]

    if (pnpmList.length === 0)
      throw new Error('Something went wrong with pnpm list')

    Object.keys(stubs).forEach(key => {
      stubs[key as keyof typeof stubs].base =
        pnpmList[0].dependencies?.[key]?.path
    })
  } else if (process.env.NODE_PACKAGE_MANAGER === 'yarn') {
    // Note: The CLI commands are different across yarn versions for getting the
    // path to a dependency.

    // At this point, it's likely yarn is running in PnP mode.
    printTitle(CoreMeta.colors.magenta, 'Yarn: Unplugging Dependencies')
    console.log()

    // For now, we need to `unplug` each dependency to get the path to the
    // package.
    needsReplug = true

    for (const key of Object.keys(stubs)) {
      // This may fail if the package is not a dependency for this action.
      try {
        const output = execSync(`yarn unplug ${key}`).toString()
        console.log(`Unplugged: ${key}`)

        // Next, get the path to the package. Unfortunately using the `--json`
        // flag with `yarn unplug` does not output the target path, so we need
        // to parse it from the plaintext output.
        const packagePath = output.match(/Will unpack .* to (?<packagePath>.*)/)
          ?.groups?.packagePath

        if (!packagePath) throw new Error(`Could not unplug ${key}`)

        stubs[key as keyof typeof stubs].base = path.join(
          packagePath,
          'node_modules',
          key
        )
      } catch {
        // This is fine...
      }
    }
  }

  console.log('')
  printTitle(CoreMeta.colors.green, 'Running Action')
  console.log('')

  // The entrypoint is OS-specific. On Windows, it has to start with a leading
  // slash, then the drive letter, followed by the rest of the path. In both
  // cases, the path separators are converted to forward slashes.
  const osEntrypoint =
    process.platform !== 'win32'
      ? path.resolve(EnvMeta.entrypoint)
      : // On Windows, the entrypoint requires a leading slash if the action is
        // ESM. Otherwise, it can be omitted.
        actionType === 'esm'
        ? '/' + path.resolve(EnvMeta.entrypoint)
        : path.resolve(EnvMeta.entrypoint.replaceAll(path.sep, '/'))

  // Stub the `@actions/toolkit` libraries and run the action. Quibble and
  // local-action require a different approach depending on if the called action
  // is written in ESM. The stubs should only be loaded if the corresponding
  // package is installed.
  if (actionType === 'esm') {
    if (stubs['@actions/github'].base)
      await quibble.esm(
        path.resolve(
          stubs['@actions/github'].base,
          ...stubs['@actions/github'].lib
        ),
        stubs['@actions/github'].stubs
      )

    if (stubs['@actions/core'].base)
      await quibble.esm(
        path.resolve(
          stubs['@actions/core'].base,
          ...stubs['@actions/core'].lib
        ),
        stubs['@actions/core'].stubs
      )

    if (stubs['@actions/artifact'].base)
      await quibble.esm(
        path.resolve(
          stubs['@actions/artifact'].base,
          ...stubs['@actions/artifact'].lib
        ),
        stubs['@actions/artifact'].stubs
      )

    // ESM actions need to be imported, not required.
    const { run } = await import(osEntrypoint)

    // Check if the required path is a function.
    if (typeof run !== 'function')
      throw new Error(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )

    try {
      await run()
    } finally {
      if (process.env.NODE_PACKAGE_MANAGER === 'yarn' && needsReplug)
        replug(fs, packageJsonPath, Object.keys(stubs))
    }
  } else {
    if (stubs['@actions/github'].base)
      quibble(
        path.resolve(
          stubs['@actions/github'].base,
          ...stubs['@actions/github'].lib
        ),
        stubs['@actions/github'].stubs
      )

    if (stubs['@actions/core'].base)
      quibble(
        path.resolve(
          stubs['@actions/core'].base,
          ...stubs['@actions/core'].lib
        ),
        stubs['@actions/core'].stubs
      )

    if (stubs['@actions/artifact'].base)
      quibble(
        path.resolve(
          stubs['@actions/artifact'].base,
          ...stubs['@actions/artifact'].lib
        ),
        stubs['@actions/artifact'].stubs
      )

    // CJS actions need to be required, not imported.
    const { run } = require(osEntrypoint)

    // Check if the required path is a function.
    if (typeof run !== 'function')
      throw new Error(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )

    try {
      await run()
    } finally {
      if (process.env.NODE_PACKAGE_MANAGER === 'yarn' && needsReplug)
        replug(fs, packageJsonPath, Object.keys(stubs))
    }
  }
}

/**
 * "Re-plugs" yarn dependencies.
 *
 * For yarn PnP support, we need to unplug any stubbed dependencies. This should
 * only be temporary, so as a final step we need to "re-plug" them.
 *
 * In this case, we're taking the easy way and just updating the
 * `dependenciesMeta` property in `package.json`.
 */
export function replug(
  fs: typeof import('fs'),
  packageJsonPath: string,
  stubs: string[]
): void {
  console.log()
  printTitle(CoreMeta.colors.magenta, 'Yarn: Re-Plugging Dependencies')
  console.log()

  // For each of the stubs, remove the "unplugged" property from the
  // `dependenciesMeta` property in package.json.
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, { encoding: 'utf8', flag: 'r' })
  ) as {
    dependenciesMeta: {
      [key: string]: {
        unplugged?: boolean
      }
    }
  }

  // Remove the unplugged property from the dependenciesMeta object.
  for (const stub of stubs)
    for (const key of Object.keys(packageJson.dependenciesMeta ?? {}))
      if (key.startsWith(stub)) {
        packageJson.dependenciesMeta[key].unplugged = false
        console.log(`Replugged: ${stub}`)
      }

  // Save the file.
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), {
    encoding: 'utf8',
    flag: 'w'
  })
}
