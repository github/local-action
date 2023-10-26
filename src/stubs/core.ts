import * as path from 'path'

import { EnvMeta } from './env'
import {
  AnnotationProperties,
  ExitCode,
  InputOptions,
  CoreMetadata
} from '../interfaces'

export const CoreMeta: CoreMetadata = {
  exitCode: ExitCode.Success,
  exitMessage: '',
  outputs: {},
  secrets: [],
  stepDebug: process.env.ACTIONS_STEP_DEBUG === 'true',
  echo: false,
  state: {},
  colors: {
    cyan: console.log,
    blue: console.log,
    gray: console.log,
    green: console.log,
    magenta: console.log,
    red: console.log,
    white: console.log,
    yellow: console.log
  }
}

export function ResetCoreMetadata(): void {
  CoreMeta.exitCode = ExitCode.Success
  CoreMeta.exitMessage = ''
  CoreMeta.outputs = {}
  CoreMeta.secrets = []
  CoreMeta.stepDebug = process.env.ACTIONS_STEP_DEBUG === 'true'
  CoreMeta.echo = false
  CoreMeta.state = {}
}

/**
 * Stubs for `@actions/core` methods
 */
export const CoreStubs = {
  //-----------------------------------------------------------------------
  // Variables
  //-----------------------------------------------------------------------

  /**
   * Saves an environment variable
   */
  exportVariable: (name: string, value: string): void => {
    EnvMeta.env[name] = value
    process.env[name] = value
  },

  /**
   * Register a secret to mask it in logs
   */
  setSecret: (secret: string): void => {
    CoreMeta.secrets.push(secret)
  },

  /**
   * Prepends to the PATH
   */
  addPath: (inputPath: string): void => {
    EnvMeta.path = `${inputPath}${path.delimiter}${process.env.PATH}`
    process.env.PATH = EnvMeta.path
  },

  /**
   * Gets the action inputs from environment variables
   */
  getInput: (name: string, options?: InputOptions): string => {
    // This is effectively a copy of the actual `getInput` function, instead of
    // using proxyquire's `callThru()` option.

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
  },

  /**
   * Gets multiline inputs from environment variables
   */
  getMultilineInput: (name: string, options?: InputOptions): string[] => {
    // This is effectively a copy of the actual `getInput` function, instead of
    // using proxyquire's `callThru()` option.

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
  },

  /**
   * Gets boolean inputs from environment variables
   */
  getBooleanInput: (name: string, options?: InputOptions): boolean => {
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
  },

  /**
   * Saves outputs and logs to the console
   */
  setOutput: (name: string, value: string): void => {
    CoreMeta.outputs[name] = value

    // This command is deprecated...using here to have a meaningful log output
    CoreMeta.colors.cyan(`::set-output name=${name}::${value}`)
  },

  /**
   * Enables or disables the echoing of commands into stdout. For local testing
   * purposes, this currently does nothing.
   */
  setCommandEcho: (enabled: boolean): void => {
    CoreMeta.echo = enabled
  },

  //-----------------------------------------------------------------------
  // Results
  //-----------------------------------------------------------------------

  /**
   * Set the action status to failed
   */
  setFailed: (message: string | Error): void => {
    CoreMeta.exitCode = ExitCode.Failure
    CoreMeta.exitMessage = message.toString()

    CoreStubs.error(message.toString())
  },

  //-----------------------------------------------------------------------
  // Logging Commands
  //-----------------------------------------------------------------------

  // Logs a message with optional annotations
  log: (
    type: string,
    message?: string,
    properties: AnnotationProperties = {}
  ): void => {
    const params: string[] = []

    const color = {
      debug: CoreMeta.colors.gray,
      error: CoreMeta.colors.red,
      warning: CoreMeta.colors.yellow,
      notice: CoreMeta.colors.magenta,
      info: CoreMeta.colors.white,
      group: CoreMeta.colors.blue,
      endgroup: CoreMeta.colors.blue
    }[type]

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

    if (message === undefined) {
      color(`::${type}::`)
      return
    }

    // Check for any secrets and redact them
    for (const secret of CoreMeta.secrets) {
      if (message.includes(secret)) {
        message = message.replaceAll(secret, '****')
      }
    }

    if (params.length > 0) color(`::${type} ${params.join(',')}::${message}`)
    else color(`::${type}::${message}`)
  },

  /**
   * Returns true if debugging is enabled
   */
  isDebug: (): boolean => {
    return CoreMeta.stepDebug
  },

  /**
   * Logs a debug message to the console
   */
  debug: (message: string): void => {
    // Only log debug messages if the `stepDebug` flag is set
    if (!CoreMeta.stepDebug) return

    CoreStubs.log('debug', message)
  },

  /**
   * Logs an error message to the console
   *
   * ::error file={name},line={line},endLine={endLine},title={title}::{message}
   */
  error: (message: string, properties: AnnotationProperties = {}): void => {
    CoreStubs.log('error', message, properties)
  },

  /**
   * Logs a warning message to the console
   *
   * ::warning file={name},line={line},endLine={endLine},title={title}::{message}
   */
  warning: (message: string, properties: AnnotationProperties = {}): void => {
    CoreStubs.log('warning', message, properties)
  },

  /**
   * Logs a notice message to the console
   *
   * ::notice file={name},line={line},endLine={endLine},title={title}::{message}
   */
  notice: (message: string, properties: AnnotationProperties = {}): void => {
    CoreStubs.log('notice', message, properties)
  },

  /**
   * Logs an info message to the console
   */
  info: (message: string): void => {
    CoreStubs.log('info', message)
  },

  /**
   * Starts a group of log lines
   */
  startGroup: (title: string): void => {
    CoreStubs.log('group', title)
  },

  /**
   * Ends a group of log lines
   */
  endGroup: (): void => {
    CoreStubs.log('endgroup')
  },

  /**
   * Wraps an asynchronous function call in a group
   */
  group: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    // Start the group
    CoreStubs.startGroup(name)

    let result: T

    try {
      // Await the function
      result = await fn()
    } finally {
      CoreStubs.endGroup()
    }

    return result
  },

  //-----------------------------------------------------------------------
  // Wrapper action state
  //-----------------------------------------------------------------------

  /**
   * Save the state of the action. For testing purposes, this does nothing other
   * than save it to the `state` property.
   */
  saveState: (name: string, value: any): void => {
    if (value === undefined || value === null) CoreMeta.state[name] = ''
    else if (typeof value === 'string' || value instanceof String)
      CoreMeta.state[name] = value as string
    else CoreMeta.state[name] = JSON.stringify(value)
  },

  /**
   * Get the state for the action. For testing purposes, this does nothing other
   * than return the value from the `state` property.
   */
  getState: (name: string): string => {
    return CoreMeta.state[name] || ''
  },

  /**
   * Gets an OIDC token
   * TODO: Implement
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  getIDToken: async (aud?: string): Promise<string> => {
    throw new Error('Not implemented')
  }
}
