#!/usr/bin/env tsx
import type { Command } from 'commander'
import { makeProgram } from './command.js'

/**
 * Runs the CLI program
 *
 * @returns A promise that resolves when the program is finished
 */
export async function run(): Promise<void> {
  const chalk = (await import('chalk')).default
  const { textSync } = (await import('figlet')).default

  // Print the header
  console.log(chalk.blue(textSync('Action Debugger')))

  // Run the program
  const program: Command = await makeProgram()
  program.parse()
}

/* istanbul ignore next */
run()
