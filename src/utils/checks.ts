import { InvalidArgumentError } from 'commander'
import fs from 'fs'
import path from 'path'

import { EnvMeta } from '../stubs/env'

/**
 * Checks if the provided action path is valid
 * @param value The action path
 * @returns The resolved action path
 */
export function checkActionPath(value: string): string {
  const actionPath = path.resolve(value)

  try {
    const stat = fs.statSync(actionPath)

    // Confirm the value is a directory
    if (!stat.isDirectory())
      throw new InvalidArgumentError('Action path must be a directory')
  } catch (err: any) {
    if (err.code === 'ENOENT')
      throw new InvalidArgumentError('Action path does not exist')

    throw new InvalidArgumentError(err.message)
  }

  const actionFile = path.resolve(actionPath, 'action.yml')

  // Confirm there is an `action.yml` in the directory
  if (!fs.existsSync(actionFile))
    throw new InvalidArgumentError(
      'Action path must contain an action.yml file'
    )

  // Save the action path and file to environment metadata
  EnvMeta.actionPath = actionPath
  EnvMeta.actionFile = path.resolve(EnvMeta.actionPath, 'action.yml')

  return path.resolve(value)
}

/**
 * Checks if the provided entrypoint is valid
 * @param value The entrypoint
 * @returns The resolved entrypoint path
 */
export function checkEntryPoint(value: string): string {
  const entrypoint = path.resolve(EnvMeta.actionPath, value)

  // Confirm the entrypoint exists
  if (!fs.existsSync(entrypoint))
    throw new InvalidArgumentError('Entrypoint does not exist')

  // Save the action entrypoint to environment metadata
  EnvMeta.entrypoint = entrypoint

  return entrypoint
}

/**
 * Checks if the provided env file is valid
 * @param value The env file path
 * @returns The resolved env file path
 */
export function checkEnvFile(value: string): string {
  const envFile = path.resolve(value)

  // Confirm the env file exists
  if (!fs.existsSync(envFile))
    throw new InvalidArgumentError('Environment file does not exist')

  // Save the .env file path to environment metadata
  EnvMeta.envFile = envFile

  return envFile
}
