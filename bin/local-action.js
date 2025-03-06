#!/usr/bin/env node
import * as fs from 'fs'
import { execSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as path from 'path'

/**
 * This script is used to run the local action. It sets the NODE_OPTIONS
 * environment variable to require the bootstrap script, which sets up the
 * TypeScript environment for the action.
 */

function entrypoint() {
  const __dirname = dirname(fileURLToPath(import.meta.url))

  // Save the current environment and path.
  const envBackup = { ...process.env }
  const pathBackup = process.env.PATH

  // Delete the TARGET_ACTION_PATH environment variable.
  delete process.env.TARGET_ACTION_PATH

  try {
    // Get the absolute path to the `@github/local-action` package.
    const packagePath = path.resolve(__dirname, '..')

    // Get the absolute path to the bootstrap script. On Windows systems, this
    // need to be double-escaped so the path resolves correctly.
    const bootstrapPath =
      process.platform === 'win32'
        ? path.join(packagePath, 'src', 'bootstrap.ts').replaceAll('\\', '\\\\')
        : path.join(packagePath, 'src', 'bootstrap.ts')

    // Require the bootstrap script in NODE_OPTIONS.
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS
      ? `${process.env.NODE_OPTIONS} --require "${bootstrapPath}"`
      : `--require "${bootstrapPath}"`

    // Disable experimental warnings.
    process.env.NODE_NO_WARNINGS = 1

    // Start building the command to run local-action. The package manager will
    // be prepended to this later.
    let command = `tsx "${path.join(packagePath, 'src', 'index.ts')}"`

    // If there are no input arguments, or the only argument is the help flag,
    // display the help message.
    if (
      process.argv.length === 2 ||
      ['--help', '-h'].includes(process.argv[2])
    ) {
      command += ` --help`

      // Run the command.
      execSync(command, { stdio: 'inherit' })
      return
    }

    // Iterate over the arguments and build the command.
    for (const arg of process.argv.slice(2)) {
      // If the argument is a directory and TARGET_ACTION_PATH is not set, set
      // it to the absolute path of the directory. The first directory is the
      // target action path.
      if (
        !process.env.TARGET_ACTION_PATH &&
        fs.existsSync(path.resolve(arg)) &&
        fs.lstatSync(path.resolve(arg)).isDirectory()
      )
        process.env.TARGET_ACTION_PATH = path.resolve(arg)

      // Append the argument to the command.
      command += ` ${arg}`
    }

    // Starting in the TARGET_ACTION_PATH, locate the package.json file and
    // determine the package manager.
    const actionPackageDirs = path
      .resolve(process.env.TARGET_ACTION_PATH)
      .split(path.sep)

    while (actionPackageDirs.length > 0) {
      const actionPackage = actionPackageDirs.join(path.sep)

      // Check if the package.json file exists.
      if (fs.existsSync(path.join(actionPackage, 'package.json'))) {
        // Read the package.json file.
        const json = JSON.parse(
          fs.readFileSync(path.join(actionPackage, 'package.json')),
          'utf8'
        )

        // If the package.json file has a packageManager field, set the
        // command to use that package manager.
        if (json.packageManager?.startsWith('pnpm')) {
          process.env.NODE_PACKAGE_MANAGER = 'pnpm'
          command = 'pnpm dlx ' + command
        } else if (json.packageManager?.startsWith('yarn')) {
          process.env.NODE_PACKAGE_MANAGER = 'yarn'

          // The older version of yarn does not support `yarn dlx`, so we fall
          // back to `yarn exec`.
          if (json.packageManager.startsWith('yarn@1'))
            command = 'yarn exec ' + command
          else command = 'yarn dlx ' + command
        } else {
          // Otherwise, fall back to npm.
          process.env.NODE_PACKAGE_MANAGER = 'npm'
          command = 'npm exec ' + command
        }

        break
      }

      // Remove the last directory from the path.
      actionPackageDirs.pop()
    }

    if (actionPackageDirs.length === 0) {
      console.log(
        'No package.json file found in the action directory or any parent directories.'
      )
      process.exit(1)
    }

    // Run the command.
    execSync(command, { stdio: 'inherit' })
  } catch (error) {
    process.exit(error.status)
  } finally {
    // Restore the environment.
    process.env = { ...envBackup }
    process.env.PATH = pathBackup
  }
}

entrypoint()
