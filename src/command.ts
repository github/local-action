import type { Command } from 'commander'
import * as commander from 'commander'
import * as run from './commands/run'
import { checkActionPath, checkEntryPoint, checkEnvFile } from './utils/checks'

export function makeProgram(): Command {
  const program = new commander.Command()

  program
    .name('local-action')
    .description('Test a GitHub Action locally')
    .version('0.1.0')

  program
    .command('run', { isDefault: true })
    .description('Run a local action')
    .argument('<path>', 'Path to the local action directory', checkActionPath)
    .argument(
      '<entrypoint>',
      'Action entrypoint (relative to the action directory)',
      checkEntryPoint
    )
    .argument('<env file>', 'Path to the local .env file', checkEnvFile)
    .action(async () => {
      await run.action()
    })

  return program
}
