/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * This file is used to bootstrap the environment for the action.
 *
 * It is added as a --require option to `npx tsx`. The purpose of this file is
 * to handle various configuration options. For example, if an action repository
 * makes use of TypeScript paths for module resolution, this bootstrap script
 * will parse them and register them so that modules can be resolved correctly.
 */

const { existsSync, readFileSync } = require('fs')
const { loadConfig, register } = require('tsconfig-paths')
const { parse } = require('comment-json')

if (process.env.TARGET_ACTION_PATH && process.env.TARGET_ACTION_PATH !== '') {
  // Check if the action has a `tsconfig.json` file.
  if (existsSync(`${process.env.TARGET_ACTION_PATH}/tsconfig.json`)) {
    // Load the `tsconfig.json` from the action directory.
    const actionTsConfig = parse(
      readFileSync(`${process.env.TARGET_ACTION_PATH}/tsconfig.json`, 'utf-8')
    )

    // Load the current `tsconfig.json` from the root of this directory.
    loadConfig(__dirname)

    // Get the paths from the action's `tsconfig.json`, if any.
    const paths = actionTsConfig.compilerOptions?.paths ?? {}

    // Add any path mappings from the imported action. Replace the base URL with
    // the target action path.
    // @todo Should this take into account the previous `baseUrl` value?
    register({
      baseUrl: process.env.TARGET_ACTION_PATH,
      paths,
      addMatchAll: true
    })
  }
}
