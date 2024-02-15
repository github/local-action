/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This file is used to bootstrap the environment for the action.
 *
 * It is added as a --require option to `npx tsx`. The purpose of this file is
 * to handle TypeScript configuration options such as path mapping. For example,
 * if an action repository makes use of TypeScript paths for module resolution,
 * this bootstrap script will parse them and register them so that modules can
 * be resolved correctly.
 */
if (process.env.TARGET_ACTION_PATH && process.env.TARGET_ACTION_PATH !== '') {
  const fs = require('fs')

  // Check if the action has a `tsconfig.json` file.
  if (fs.existsSync(`${process.env.TARGET_ACTION_PATH}/tsconfig.json`)) {
    const tsConfigPaths = require('tsconfig-paths')

    // Load the `tsconfig.json` from the action directory.
    const actionTsConfig = JSON.parse(
      fs.readFileSync(
        `${process.env.TARGET_ACTION_PATH}/tsconfig.json`,
        'utf-8'
      )
    )

    // Load the current `tsconfig.json` from the root of this directory.
    tsConfigPaths.loadConfig(__dirname)

    // Get the paths from the action's `tsconfig.json`, if any.
    const paths = actionTsConfig.compilerOptions.paths ?? {}

    // Add any path mappings from the imported action. Replace the base URL with
    // the target action path.
    // @todo Should this take into account the previous `baseUrl` value?
    tsConfigPaths.register({
      baseUrl: process.env.TARGET_ACTION_PATH,
      paths,
      addMatchAll: true
    })
  }
}
