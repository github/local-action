import { Command, InvalidArgumentError } from 'commander'
import { action as runAction } from './commands/run'
import { EnvMeta } from './stubs/env-stubs'

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
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      if ('code' in err && err.code === 'ENOENT')
        throw new InvalidArgumentError('Action path does not exist')
      else throw new InvalidArgumentError(err.message as string)
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    }

    const actionFile: string = path.resolve(actionPath, 'action.yml')

    // Confirm there is an `action.yml` in the directory
    if (!fs.existsSync(actionFile))
      throw new InvalidArgumentError('Path must contain an action.yml file')

    // Save the action path and file to environment metadata
    EnvMeta.actionPath = actionPath
    EnvMeta.actionFile = path.resolve(EnvMeta.actionPath, 'action.yml')

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

  program
    .name('local-action')
    .description('Test a GitHub Action locally')
    .version('1.0.0')

  program
    .command('run', { isDefault: true })
    .description('Run a local action')
    .argument('<path>', 'Path to the local action directory', checkActionPath)
    .argument(
      '<entrypoint>',
      'Action entrypoint (relative to the action directory)',
      checkEntrypoint
    )
    .argument('<env file>', 'Path to the local .env file', checkDotenvFile)
    .action(async () => {
      await runAction()
    })

  return program
}
