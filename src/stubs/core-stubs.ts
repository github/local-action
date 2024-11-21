import path from 'path'
import type {
  AnnotationProperties,
  CoreMetadata,
  InputOptions
} from '../types.js'
import { EnvMeta } from './env-stubs.js'
import { Summary } from './summary-stubs.js'

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
  saveState,
  setCommandEcho,
  setFailed,
  setOutput,
  setSecret,
  startGroup,
  summary: new Summary(),
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
    /* istanbul ignore next */ process.env.GITHUB_STEP_SUMMARY ?? '',
  colors: {
    cyan: /* istanbul ignore next */ (msg: string) => console.log(msg),
    blue: /* istanbul ignore next */ (msg: string) => console.log(msg),
    gray: /* istanbul ignore next */ (msg: string) => console.log(msg),
    green: /* istanbul ignore next */ (msg: string) => console.log(msg),
    magenta: /* istanbul ignore next */ (msg: string) => console.log(msg),
    red: /* istanbul ignore next */ (msg: string) => console.log(msg),
    white: /* istanbul ignore next */ (msg: string) => console.log(msg),
    yellow: /* istanbul ignore next */ (msg: string) => console.log(msg)
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

//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------

/**
 * Saves an environment variable
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
 * @param secret The value to register
 * @returns void
 */
export function setSecret(secret: string): void {
  CoreMeta.secrets.push(secret)
}

/**
 * Prepends to the PATH
 *
 * @param inputPath The path to prepend to the PATH
 * @returns void
 */
export function addPath(inputPath: string): void {
  EnvMeta.path = `${inputPath}${path.delimiter}${process.env.PATH}`
  process.env.PATH = EnvMeta.path
}

/**
 * Gets the action input from the environment variables
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
 * @param name The name of the input
 * @param options The options for the input
 * @returns The value of the input
 */
export function getMultilineInput(
  name: string,
  options?: InputOptions
): string[] {
  // Get input by name, split by newline, and filter out empty strings
  const input: string[] = (
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] ||
    process.env[`INPUT_${name.replace(/ /g, '_')}`] ||
    ''
  )
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
 * @param name The name of the input
 * @param options The options for the input
 * @returns The value of the input
 */
export function getBooleanInput(name: string, options?: InputOptions): boolean {
  // This is effectively a copy of the actual `getInput` function, instead of
  // using proxyquire's `callThru()` option.

  // Get input by name, or an empty string if not found
  const input: string = (
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] ||
    process.env[`INPUT_${name.replace(/ /g, '_')}`] ||
    ''
  ).trim()

  // Throw an error if the input is required and not supplied
  if (options && options.required === true && input === '')
    throw new Error(`Input required and not supplied: ${name}`)

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
 * @todo Currently this does nothing.
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

  /* istanbul ignore next */
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
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function error(
  message: string,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  log('error', message, properties)
}

/**
 * Logs a warning message to the console
 *
 * E.g. `::warning file={name},line={line},endLine={endLine},title={title}::{message}`
 *
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function warning(
  message: string,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  log('warning', message, properties)
}

/**
 * Logs a notice message to the console
 *
 * E.g. `::notice file={name},line={line},endLine={endLine},title={title}::{message}`
 *
 * @param message The message to log
 * @param properties The annotation properties
 * @returns void
 */
export function notice(
  message: string,
  properties: AnnotationProperties = {
    title: undefined,
    file: undefined,
    startLine: undefined,
    endLine: undefined,
    startColumn: undefined,
    endColumn: undefined
  }
): void {
  log('notice', message, properties)
}

/**
 * Logs an info message to the console
 *
 * E.g. `::info::{message}`
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
 * For testing purposes, this does nothing other than save it to the `state`
 * property.
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
 * For testing purposes, this does nothing other than return the value from the
 * `state` property.
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
 * @todo Implement
 *
 * @param aud The audience for the token
 * @returns A promise that resolves the OIDC token
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getIDToken(aud?: string): Promise<string> {
  throw new Error('Not implemented')
}

//-----------------------------------------------------------------------
// Path exports
//-----------------------------------------------------------------------

/**
 * Converts the given path to the posix form. On Windows, `\\` will be replaced
 * with `/`.
 *
 * @param pth Path to transform
 * @return Posix path
 */
export function toPosixPath(pth: string): string {
  return pth.replace(/[\\]/g, '/')
}

/**
 * Converts the given path to the win32 form. On Linux, `/` will be replaced
 * with `\\`.
 *
 * @param pth Path to transform
 * @return Win32 path
 */
export function toWin32Path(pth: string): string {
  return pth.replace(/[/]/g, '\\')
}

/**
 * Converts the given path to a platform-specific path. It does this by
 * replacing instances of `/` and `\` with the platform-specific path separator.
 *
 * @param pth The path to platformize
 * @return The platform-specific path
 */
export function toPlatformPath(pth: string): string {
  return pth.replace(/[/\\]/g, path.sep)
}
