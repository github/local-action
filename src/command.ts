import { Command, InvalidArgumentError } from 'commander'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { action } from './commands/run.js'
import { EnvMeta } from './stubs/env.js'

/**
 * Creates the CLI Program
 *
 * @returns Command Program Object
 */
export async function makeProgram(): Promise<Command> {
  const program: Command = new Command()
  const fs = await import('fs')
  const path = await import('path')
  const __dirname = dirname(fileURLToPath(import.meta.url))

  /**
   * Checks if Action Path is Valid
   *
   * @param value Action Path
   * @returns Resolved Action Path
   * @throws InvalidArgumentError
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
   * Checks if `main` Entrypoint is Valid
   *
   * @param value Entrypoint
   * @returns Resolved Entrypoint Path
   * @throws InvalidArgumentError
   */
  function checkEntrypoint(value: string): string {
    const entrypoint: string = path.resolve(EnvMeta.actionPath, value)

    // Confirm the entrypoint exists
    if (!fs.existsSync(entrypoint))
      throw new InvalidArgumentError(`Entrypoint does not exist: ${value}`)

    // Save the action entrypoint to environment metadata
    EnvMeta.entrypoint = entrypoint

    return entrypoint
  }

  /**
   * Checks if `pre` Entrypoint is Valid
   *
   * @param value Entrypoint
   * @returns Resolved Entrypoint Path
   * @throws InvalidArgumentError
   */
  function checkPreEntrypoint(value: string): string {
    const entrypoint: string = path.resolve(EnvMeta.actionPath, value)

    // Confirm the entrypoint exists
    if (!fs.existsSync(entrypoint))
      throw new InvalidArgumentError(
        `PRE entrypoint does not exist: ${entrypoint}`
      )

    // Save the action entrypoint to environment metadata
    EnvMeta.preEntrypoint = entrypoint

    return entrypoint
  }

  /**
   * Checks if `post` Entrypoint is Valid
   *
   * @param value Entrypoint
   * @returns Resolved Entrypoint Path
   * @throws InvalidArgumentError
   */
  function checkPostEntrypoint(value: string): string {
    const entrypoint: string = path.resolve(EnvMeta.actionPath, value)

    // Confirm the entrypoint exists
    if (!fs.existsSync(entrypoint))
      throw new InvalidArgumentError(`POST entrypoint does not exist: ${value}`)

    // Save the action entrypoint to environment metadata
    EnvMeta.postEntrypoint = entrypoint

    return entrypoint
  }

  /**
   * Checks if `dotenv` File is Valid
   *
   * @param value Dotenv File Path
   * @returns Resolved Dotenv File Path
   * @throws InvalidArgumentError
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

  program
    .name('local-action')
    .description('Test a GitHub Action locally')
    .version(
      `Version: ${JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8')).version as string}`
    )

  program
    .command('run', { isDefault: true })
    .description('Run a GitHub Action locally')
    .argument('<action path>', 'Path to the action directory', checkActionPath)
    .argument(
      '<entrypoint>',
      'Action entrypoint (relative to the action directory)',
      checkEntrypoint
    )
    .argument('<dotenv file>', 'Path to the local .env file', checkDotenvFile)
    .option(
      '--pre <pre>',
      'Action pre entrypoint (relative to the action directory)',
      checkPreEntrypoint,
      undefined
    )
    .option(
      '--post <post>',
      'Action post entrypoint (relative to the action directory)',
      checkPostEntrypoint,
      undefined
    )
    .action(async (actionPath, entrypoint, dotenvFile, options) => {
      await action(actionPath, entrypoint, dotenvFile, options)
    })

  return program
}
