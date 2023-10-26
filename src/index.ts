#!/usr/bin/env ts-node

/**
 * Tests an action.yml locally
 */
import { textSync } from 'figlet'

import { makeProgram } from './command'

// TODO: JavaScript action support
// TODO: Container action support
// TODO: Composite action support

export default async function run(): Promise<void> {
  const chalk = (await import('chalk')).default

  // Print the header
  console.log(chalk.blue(textSync('Action Debugger')))

  // Run the program
  const program = makeProgram()
  program.parse()
}

/* c8 ignore start */
if (require.main === module) run()
/* c8 ignore stop */
