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
        ? path
            .join(packagePath, 'src', 'bootstrap.mts')
            .replaceAll('\\', '\\\\')
        : path.join(packagePath, 'src', 'bootstrap.mts')

    // Require the bootstrap script in NODE_OPTIONS.
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS
      ? `${process.env.NODE_OPTIONS} --require "${bootstrapPath}"`
      : `--require "${bootstrapPath}"`

    // Disable experimental warnings.
    process.env.NODE_NO_WARNINGS = 1

    // Start building the command to run local-action.
    let command = `npx tsx "${path.join(packagePath, 'src', 'index.ts')}"`

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
