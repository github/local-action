/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/core/src/core.ts
 *
 * @remarks
 *
 * - Across the board, the `issueCommand` and `issueFileCommand` calls were
 *   removed for easier implementation and testing.
 */

import path from 'path'
import type { CoreMetadata } from '../../types.js'
import { EnvMeta } from '../env.js'
import { toPlatformPath, toPosixPath, toWin32Path } from './path-utils.js'
import * as platform from './platform.js'
import { Summary } from './summary.js'

export const CORE_STUBS = {
  addPath,
  debug,
  endGroup,
  error,
  exportVariable,
  getBooleanInput,
  getIDToken,
  getInput,
  getMultilineInput,
  getState,
  group,
  info,
  isDebug,
  notice,
  platform,
  saveState,
  setCommandEcho,
  setFailed,
  setOutput,
  setSecret,
  startGroup,
  summary: new Summary(),
  toPlatformPath,
  toPosixPath,
  toWin32Path,
  warning
}

/**
 * Metadata for `@actions/core`
 */
export const CoreMeta: CoreMetadata = {
  echo: false,
  exitCode: 0,
  exitMessage: '',
  outputs: {},
  secrets: [],
  state: {},
  stepDebug: process.env.ACTIONS_STEP_DEBUG === 'true',
  stepSummaryPath:
    /* istanbul ignore next*/ process.env.GITHUB_STEP_SUMMARY ?? '',
  colors: {
    cyan: (msg: string) => console.log(msg),
    blue: (msg: string) => console.log(msg),
    gray: (msg: string) => console.log(msg),
    green: (msg: string) => console.log(msg),
    magenta: (msg: string) => console.log(msg),
    red: (msg: string) => console.log(msg),
    white: (msg: string) => console.log(msg),
    yellow: (msg: string) => console.log(msg)
  }
}

/**
 * Resets the core metadata
 *
 * @returns void
 */
export function ResetCoreMetadata(): void {
  CoreMeta.echo = false
  CoreMeta.exitCode = 0
  CoreMeta.exitMessage = ''
  CoreMeta.outputs = {}
  CoreMeta.secrets = []
  CoreMeta.state = {}
  CoreMeta.stepDebug = process.env.ACTIONS_STEP_DEBUG === 'true'
  CoreMeta.stepSummaryPath = process.env.GITHUB_STEP_SUMMARY ?? ''
}

/**
 * Optional properties that can be sent with annotation commands (notice, error,
 * and warning).
 */
export type AnnotationProperties = {
  /** A title for the annotation. */
  title?: string

  /** The path of the file for which the annotation should be created. */
  file?: string

  /** The start line for the annotation. */
  startLine?: number

  /**
   * The end line for the annotation. Defaults to `startLine` when `startLine`
   * is provided.
   */
  endLine?: number

  /**
   * The start column for the annotation. Cannot be sent when `startLine` and
   * `endLine` are different values.
   */
  startColumn?: number

  /**
   * The end column for the annotation. Cannot be sent when `startLine` and
   * `endLine` are different values. Defaults to `startColumn` when
   * `startColumn` is provided.
   */
  endColumn?: number
}

/**
 * Options for getInput.
 */
export type InputOptions = {
  /**
   * Optional. Whether the input is required. If required and not present,
   * will throw. Defaults to false.
   */
  required?: boolean

  /**
   * Optional. Whether leading/trailing whitespace will be trimmed for the
   * input. Defaults to true.
   */
  trimWhitespace?: boolean
}

/**
 * Prepends to the PATH
 *
 * @remarks
 *
 * - Use environment metadata to track updated PATH
 *
 * @param inputPath The path to prepend to the PATH
 * @returns void
 */
export function addPath(inputPath: string): void {
  EnvMeta.path = `${inputPath}${path.delimiter}${process.env.PATH}`
  process.env.PATH = EnvMeta.path
}

//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------

/**
 * Saves an environment variable
 *
 * @remarks
 *
 * - Saves variables to the environment metadata.
 *
 * @param name The name of the environment variable
 * @param value The value of the environment variable
 * @returns void
 */
export function exportVariable(
  name: string,
  value: string | undefined | null | object
): void {
  // Convert the value to a string
  value =
    value === undefined || value === null
      ? ''
      : typeof value === 'string' || value instanceof String
        ? value.toString()
        : JSON.stringify(value)

  EnvMeta.env[name] = value
  process.env[name] = value
}

/**
 * Register a secret to mask it in logs
 *
 * @remarks
 *
 * - Adds secrets to core metadata.
 *
 * @param secret The value to register
 * @returns void
 */
export function setSecret(secret: string): void {
  CoreMeta.secrets.push(secret)
}

/**
 * Gets the action input from the environment variables
 *
 * @remarks
 *
 * - Adds support for lowercase environment variables.
 * - Checks default values from the action.yml file.
 *
 * @param name The name of the input
 * @param options The options for the input
 * @returns The value of the input
 */
export function getInput(name: string, options?: InputOptions): string {
  // Get input by name, or an empty string if not found
  let input: string =
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] ||
    process.env[`INPUT_${name.replace(/ /g, '_')}`] ||
    ''

  // If the input is not present in the environment variables, it has not been
  // set. In that case, check the default value.
  if (input === '' && EnvMeta.inputs[name]?.default !== undefined)
    input = EnvMeta.inputs[name].default.toString()

  // Throw an error if the input is required and not supplied
  if (options && options.required === true && input === '')
    throw new Error(`Input required and not supplied: ${name}`)

  // Trim whitespace, if specified
  if (options && options.trimWhitespace === true) input = input.trim()

  return input
}

/**
 * Gets multiline inputs from environment variables
 *
 * @remarks
 *
 * - Adds support for lowercase environment variables.
 * - Checks default values from the action.yml file.
 *
 * @param name The name of the input
 * @param options The options for the input
 * @returns The value of the input
 */
export function getMultilineInput(
  name: string,
  options?: InputOptions
): string[] {
  // Get input by name, split by newline, and filter out empty strings
  let input: string[] = (
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] ||
    process.env[`INPUT_${name.replace(/ /g, '_')}`] ||
    ''
  )
    .split('\n')
    .filter(x => x !== '')

  // If the input is not present in the environment variables, it has not been
  // set. In that case, check the default value.
  if (input.length === 0 && EnvMeta.inputs[name]?.default !== undefined)
    input = EnvMeta.inputs[name].default
      .toString()
      .split('\n')
      .filter(x => x !== '')

  // Throw an error if the input is required and not supplied
  if (options && options.required === true && input.length === 0)
    throw new Error(`Input required and not supplied: ${name}`)

  // Trim whitespace, if specified
  if (options && options.trimWhitespace === true)
    return input.map(x => x.trim())

  return input
}

/**
 * Gets boolean inputs from environment variables
 *
 * @remarks
 *
 * - Adds support for lowercase environment variables.
 * - Checks default values from the action.yml file.
 *
 * @param name The name of the input
 * @param options The options for the input
 * @returns The value of the input
 */
export function getBooleanInput(name: string, options?: InputOptions): boolean {
  // This is effectively a copy of the actual `getInput` function, instead of
  // using proxyquire's `callThru()` option.

  // Get input by name, or an empty string if not found
  let input: string = (
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] ||
    process.env[`INPUT_${name.replace(/ /g, '_')}`] ||
    ''
  ).trim()

  // If the input is not present in the environment variables, it has not been
  // set. In that case, check the default value.
  if (input === '' && EnvMeta.inputs[name]?.default !== undefined) {
    // we call .toString in case its a boolean
    input = EnvMeta.inputs[name].default.toString().trim()
  }

  // Throw an error if the input is required and not supplied
  if (input === '')
    if (options && options.required === true) {
      throw new Error(`Input required and not supplied: ${name}`)
    } else {
      // here is where we would ideally return either `false` or `undefined` but we'll need upstream changes
    }

  if (['true', 'True', 'TRUE'].includes(input)) return true
  if (['false', 'False', 'FALSE'].includes(input)) return false

  // Throw an error if the input is not a boolean
  throw new TypeError(
    `Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
      `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``
  )
}

/**
 * Saves outputs and logs to the console
 *
 * @remarks
 *
 * - Saves outputs to the core metadata.
 * - Adds extra debugging output.
 *
 * @param name The name of the output
 * @param value The value of the output
 * @returns void
 */
export function setOutput(name: string, value: string): void {
  CoreMeta.outputs[name] = value

  // This command is deprecated...it is being used here so there's meaningful
  // log output for debugging purposes.
  CoreMeta.colors.cyan(`::set-output name=${name}::${value}`)
}

/**
 * Enables or disables the echoing of commands into stdout.
 *
 * @remarks
 *
 * - Currently this does nothing.
 *
 * @param enabled Whether to enable command echoing
 * @returns void
 */
export function setCommandEcho(enabled: boolean): void {
  CoreMeta.echo = enabled
}

//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------

/**
 * Set the action status to failed
 *
 * @remarks
 *
 * - Sets exit code and message in core metadata.
 * - Does not set a failure exit code for the process.
 *
 * @param message The message to log
 * @returns void
 */
export function setFailed(message: string | Error): void {
  CoreMeta.exitCode = 1
  CoreMeta.exitMessage = message.toString()

  error(message.toString())
}

//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------

/**
 * Logs a message with optional annotations
 *
 * This is used internally by the other logging functions. It doesn't need to be
 * called directly.
 *
 * @remarks
 *
 * - This is specific to the local-action tool and is used to centralize log
 *   formatting and styling.
 *
 * @param type The type of log message
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function log(
  type: string,
  message?: string,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  const params: string[] = []

  const color =
    {
      debug: CoreMeta.colors.gray,
      error: CoreMeta.colors.red,
      warning: CoreMeta.colors.yellow,
      notice: CoreMeta.colors.magenta,
      info: CoreMeta.colors.white,
      group: CoreMeta.colors.blue,
      endgroup: CoreMeta.colors.blue
    }[type] ?? CoreMeta.colors.gray

  // Default endLine to startLine if not provided
  if (properties.startLine && !properties.endLine)
    properties.endLine = properties.startLine

  // Default endColumn to startColumn if not provided
  if (properties.startColumn && !properties.endColumn)
    properties.endColumn = properties.startColumn

  // Throw an error if startLine and endLine are different and startColumn or
  // endColumn are set
  if (
    properties.startLine &&
    properties.endLine &&
    properties.startLine !== properties.endLine &&
    (properties.startColumn || properties.endColumn)
  )
    throw new Error(
      'Error: Annotations spanning multiple lines must not include startColumn or endColumn'
    )

  if (properties.title) params.push(`title=${properties.title}`)
  if (properties.file) params.push(`file=${properties.file}`)
  if (properties.startLine) params.push(`line=${properties.startLine}`)
  if (properties.endLine) params.push(`endLine=${properties.endLine}`)
  if (properties.startColumn) params.push(`col=${properties.startColumn}`)
  if (properties.endColumn) params.push(`endColumn=${properties.endColumn}`)

  if (message === undefined) return color(`::${type}::`)

  // Check for any secrets and redact them
  for (const secret of CoreMeta.secrets)
    if (message?.includes(secret)) message = message.replaceAll(secret, '****')

  if (params.length > 0) color(`::${type} ${params.join(',')}::${message}`)
  else color(`::${type}::${message}`)
}

/**
 * Returns true if debugging is enabled
 *
 * @remarks
 *
 * - Gets status from the core metadata.
 *
 * @returns Whether debugging is enabled
 */
export function isDebug(): boolean {
  return CoreMeta.stepDebug
}

/**
 * Logs a debug message to the console
 *
 * E.g. `::debug::{message}`
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param message The message to log
 * @returns void
 */
export function debug(message: string): void {
  // Only log debug messages if the `stepDebug` flag is set
  if (!CoreMeta.stepDebug) return

  log('debug', message)
}

/**
 * Logs an error message to the console
 *
 * E.g. `::error file={name},line={line},endLine={endLine},title={title}::{message}`
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function error(
  message: string | Error,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  log(
    'error',
    message instanceof Error ? message.toString() : message,
    properties
  )
}

/**
 * Logs a warning message to the console
 *
 * E.g. `::warning file={name},line={line},endLine={endLine},title={title}::{message}`
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function warning(
  message: string | Error,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  log(
    'warning',
    message instanceof Error ? message.toString() : message,
    properties
  )
}

/**
 * Logs a notice message to the console
 *
 * E.g. `::notice file={name},line={line},endLine={endLine},title={title}::{message}`
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function notice(
  message: string | Error,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  log(
    'notice',
    message instanceof Error ? message.toString() : message,
    properties
  )
}

/**
 * Logs an info message to the console
 *
 * E.g. `::info::{message}`
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param message The message to log
 * @returns void
 */
export function info(message: string): void {
  log('info', message)
}

/**
 * Starts a group of log lines
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param title The title of the group
 * @returns void
 */
export function startGroup(title: string): void {
  log('group', title, {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  })
}

/**
 * Ends a group of log lines
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param title The title of the group
 * @returns void
 */
export function endGroup(): void {
  log('endgroup', undefined, {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  })
}

/**
 * Wraps an asynchronous function call in a group
 *
 * @remarks
 *
 * - Uses custom logging utility function.
 *
 * @param name The name of the group
 * @param fn The function to call
 * @returns A promise that resolves the result of the function
 */
export async function group<T>(name: string, fn: () => Promise<T>): Promise<T> {
  // Start the group
  startGroup(name)

  let result: T

  try {
    // Await the function
    result = await fn()
  } finally {
    endGroup()
  }

  return result
}

//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------

/**
 * Save the state of the action.
 *
 * @remarks
 *
 * - Saves the value to core metadata.
 *
 * @param name The name of the state
 * @param value The value of the state
 * @returns void
 */
export function saveState(name: string, value: unknown): void {
  if (value === undefined || value === null) CoreMeta.state[name] = ''
  else if (typeof value === 'string' || value instanceof String)
    CoreMeta.state[name] = value as string
  else CoreMeta.state[name] = JSON.stringify(value)
}

/**
 * Get the state for the action.
 *
 * @remarks
 *
 * - Gets the value from core metadata.
 *
 * @param name The name of the state
 * @returns The value of the state
 */
export function getState(name: string): string {
  return CoreMeta.state[name] || ''
}

/**
 * Gets an OIDC token
 *
 * @remarks
 *
 * - Not yet implemented.
 *
 * @param aud The audience for the token
 * @returns A promise that resolves the OIDC token
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getIDToken(aud?: string): Promise<string> {
  throw new Error('Not implemented')
}
