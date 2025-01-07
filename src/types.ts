import type { Artifact } from './stubs/artifact/internal/shared/interfaces.js'

/** Environment Metadata */
export type EnvMetadata = {
  /** Path to the `action.yml` file */
  actionFile: string

  /** Path to the action directory */
  actionPath: string

  /** Map of Action Artifacts */
  artifacts: Artifact[]

  /** Path to the `.env` file */
  dotenvFile: string

  /** Environment variables */
  env: {
    [key: string]: string | undefined
    TZ?: string | undefined
  }

  /** System path */
  path: string

  /** Inputs defined in `action.yml` */
  inputs: { [key: string]: Input }

  /** Outputs defined in `action.yml` */
  outputs: { [key: string]: Output }

  /** Pre-transpilation entrypoint for the action (e.g. `src/main.ts`) */
  entrypoint: string
}

/** Metadata for `@actions/core` */
export type CoreMetadata = {
  /** Command echo setting */
  echo: boolean

  /** Exit code (0 = success, 1 = failure) */
  exitCode: 0 | 1

  /** Exit message (empty if success) */
  exitMessage: string

  /** Outputs set during action invocation */
  outputs: { [key: string]: string }

  /** Secrets registered during action invocation */
  secrets: string[]

  /** Actions step debug setting */
  stepDebug: boolean

  /** Current action state */
  state: { [key: string]: string }

  /**
   * Colors used to send output to the console
   *
   * This is not part of `@actions/core` but is included here for convenience
   * when calling related functions.
   */
  colors: {
    [key: string]: (message: string) => void
  }

  /**
   * The path to the step summary output file.
   *
   * This is not part of `@actions/core` but is included here for convenience
   * when calling related functions.
   */
  stepSummaryPath: string
}

/** Properties of an `action.yml` */
export type Action = {
  /** Name of the action */
  name: string

  /** Author of the action */
  author?: string

  /** Description of the action */
  description: string

  /** Inputs defined in the action */
  inputs: Record<string, Input>

  /** Outputs defined in the action */
  outputs: Record<string, Output>

  /** How the action is invoked */
  runs: Runs
}

/** Input properties of an `action.yml` */
export type Input = {
  /** Description of the input */
  description: string

  /** Whether the input is required */
  required?: boolean

  /** Default value of the input */
  default?: string

  /** Deprecation message for the input */
  deprecationMessage?: string
}

/** Output properties of an `action.yml` */
export type Output = {
  /** Description of the output */
  description: string
}

/** How the action is invoked */
export type Runs = {
  /** Type of event */
  using: string

  /** The entrypoint */
  main: string

  /** Script to run at the start of a job (before `main`) */
  pre?: string

  /** Conditions for the `pre` script to run */
  'pre-if'?: () => boolean

  /** Script to run at the end of a job (after `main`) */
  post?: string

  /** Conditions for the `post` script to run */
  'post-if'?: () => boolean
}
