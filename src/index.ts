#!/usr/bin/env ts-node

import type { Command } from 'commander'
import { textSync } from 'figlet'
import { makeProgram } from './command'

export async function run(): Promise<void> {
  const chalk = (await import('chalk')).default

  // Print the header
  console.log(chalk.blue(textSync('Action Debugger')))

  // Run the program
  const program: Command = makeProgram()
  program.parse()
}

/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-floating-promises
if (require.main === module) run()
