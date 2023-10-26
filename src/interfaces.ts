/**
 * Environment metadata
 */
export interface EnvMetadata {
  actionFile: string
  actionPath: string
  env: {
    [key: string]: string | undefined
    TZ?: string | undefined
  }
  envBackup: {
    [key: string]: string | undefined
    TZ?: string | undefined
  }
  envFile: string
  path: string
  pathBackup: string | undefined
  inputs: { [key: string]: Input }
  outputs: { [key: string]: Output }
  entrypoint: string
}

/**
 * Metadata for `@actions/core`
 */
export interface CoreMetadata {
  exitCode: ExitCode
  exitMessage: string
  outputs: { [key: string]: string }
  secrets: string[]
  stepDebug: boolean
  echo: boolean
  state: { [key: string]: string }
  colors: {
    [key: string]: any
  }
}

/**
 * Return value for the loadAction function
 */
export interface Action {
  inputs: Record<string, Input>
  outputs: Record<string, Output>
}

/**
 * A GitHub Actions input
 */
export interface Input {
  description: string
  required?: boolean
  default?: string
  deprecationMessage?: string
}

/**
 * A GitHub Actions output
 */
export interface Output {
  description: string
}

//-----------------------------------------------------------------------
// @actions/core
//-----------------------------------------------------------------------

/**
 * Optional properties that can be sent with annotation commands (notice, error, and warning)
 * See: https://docs.github.com/en/rest/reference/checks#create-a-check-run for more information about annotations.
 */
export interface AnnotationProperties {
  /** A title for the annotation. */
  title?: string

  /** The path of the file for which the annotation should be created. */
  file?: string

  /** The start line for the annotation. */
  startLine?: number

  /** The end line for the annotation. Defaults to `startLine` when `startLine` is provided. */
  endLine?: number

  /** The start column for the annotation. Cannot be sent when `startLine` and `endLine` are different values. */
  startColumn?: number

  /**
   * The end column for the annotation. Cannot be sent when `startLine` and `endLine` are different values.
   * Defaults to `startColumn` when `startColumn` is provided.
   */
  endColumn?: number
}

/**
 * The code to exit an action
 */
// eslint-disable-next-line no-shadow
export enum ExitCode {
  /** A code indicating that the action was successful */
  // eslint-disable-next-line no-unused-vars
  Success = 0,

  /** A code indicating that the action was a failure */
  // eslint-disable-next-line no-unused-vars
  Failure = 1
}

/**
 * Interface for getInput options
 */
export interface InputOptions {
  /** Optional. Whether the input is required. If required and not present, will throw. Defaults to false */
  required?: boolean

  /** Optional. Whether leading/trailing whitespace will be trimmed for the input. Defaults to true */
  trimWhitespace?: boolean
}

//-----------------------------------------------------------------------
// @actions/github
//-----------------------------------------------------------------------

export interface PayloadRepository {
  [key: string]: any
  full_name?: string
  name: string
  owner: {
    [key: string]: any
    login: string
    name?: string
  }
  html_url?: string
}

export interface WebhookPayload {
  [key: string]: any
  repository?: PayloadRepository
  issue?: {
    [key: string]: any
    number: number
    html_url?: string
    body?: string
  }
  pull_request?: {
    [key: string]: any
    number: number
    html_url?: string
    body?: string
  }
  sender?: {
    [key: string]: any
    type: string
  }
  action?: string
  installation?: {
    id: number
    [key: string]: any
  }
  comment?: {
    id: number
    [key: string]: any
  }
}
