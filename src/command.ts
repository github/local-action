import { Command, InvalidArgumentError } from 'commander'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { action } from './commands/run.js'
import { EnvMeta } from './stubs/env.js'

/**
 * Creates the program for the CLI
 *
 * @returns A promise that resolves to the program Command object
 */
export async function makeProgram(): Promise<Command> {
  const program: Command = new Command()
  const fs = await import('fs')
  const path = await import('path')

  /**
   * Checks if the provided action path is valid
   *
   * @param value The action path
   * @returns The resolved action path
   */
  function checkActionPath(value: string): string {
    const actionPath: string = path.resolve(value)

    try {
      // Confirm the value is a directory
      if (!fs.statSync(actionPath).isDirectory())
        throw new InvalidArgumentError('Action path must be a directory')
    } catch (err: any) {
      if ('code' in err && err.code === 'ENOENT')
        throw new InvalidArgumentError('Action path does not exist')
      else throw new InvalidArgumentError(err.message as string)
    }

    // Save the action path to environment metadata
    EnvMeta.actionPath = actionPath

    // Confirm there is an `action.yml` or `action.yaml` in the directory and
    // save the path to environment metadata
    if (fs.existsSync(path.resolve(actionPath, 'action.yml')))
      EnvMeta.actionFile = path.resolve(EnvMeta.actionPath, 'action.yml')
    else if (fs.existsSync(path.resolve(actionPath, 'action.yaml')))
      EnvMeta.actionFile = path.resolve(EnvMeta.actionPath, 'action.yaml')
    else
      throw new InvalidArgumentError(
        'Path must contain an action.yml / action.yaml file'
      )

    return path.resolve(value)
  }

  /**
   * Checks if the provided entrypoint is valid
   *
   * @param value The entrypoint
   * @returns The resolved entrypoint path
   */
  function checkEntrypoint(value: string): string {
    const entrypoint: string = path.resolve(EnvMeta.actionPath, value)

    // Confirm the entrypoint exists
    if (!fs.existsSync(entrypoint))
      throw new InvalidArgumentError('Entrypoint does not exist')

    // Save the action entrypoint to environment metadata
    EnvMeta.entrypoint = entrypoint

    return entrypoint
  }

  /**
   * Checks if the provided dotenv file is valid
   *
   * @param value The dotenv file path
   * @returns The resolved dotenv file path
   */
  function checkDotenvFile(value: string): string {
    const dotenvFile: string = path.resolve(value)

    // Confirm the dotenv file exists
    if (!fs.existsSync(dotenvFile))
      throw new InvalidArgumentError('Environment file does not exist')

    // Save the .env file path to environment metadata
    EnvMeta.dotenvFile = dotenvFile

    return dotenvFile
  }

  const __dirname = dirname(fileURLToPath(import.meta.url))

  program
    .name('local-action')
    .description('Test a GitHub Action locally')
    .version(
      `Version: ${JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8')).version as string}`
    )

  program
    .command('run', { isDefault: true })
    .description('Run a local action')
    .argument('<path>', 'Path to the local action directory', checkActionPath)
    .argument(
      '<entrypoint>',
      'Action entrypoint (relative to the action directory)',
      checkEntrypoint
    )
    .argument('<dotenv file>', 'Path to the local .env file', checkDotenvFile)
    .action(async () => {
      await action()
    })

  return program
}
