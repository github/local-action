import type { Artifact } from './stubs/artifact/internal/shared/interfaces.js'

/** Environment Metadata */
export type EnvMetadata = {
  /** Path to `action.yml` */
  actionFile: string
  /** Path to Action Directory */
  actionPath: string
  /** Map of Action Artifacts */
  artifacts: Artifact[]
  /** Path to `.env` */
  dotenvFile: string
  /** Environment Variables */
  env: {
    [key: string]: string | undefined
    TZ?: string | undefined
  }
  /** System Path */
  path: string
  /** Inputs in `action.yml` */
  inputs: { [key: string]: Input }
  /** Outputs in `action.yml` */
  outputs: { [key: string]: Output }
  /** Pre-Transpilation Action `main` Entrypoint (e.g. `src/main.ts`) */
  entrypoint: string
  /** Pre-Transpilation Action `pre` Entrypoint (e.g. `pre/main.ts`) */
  preEntrypoint: string | undefined
  /** Pre-Transpilation Action `post` Entrypoint (e.g. `post/main.ts`) */
  postEntrypoint: string | undefined
}

/** Metadata for `@actions/core` */
export type CoreMetadata = {
  /** Command Echo Setting */
  echo: boolean
  /** Exit Code (0 = success, 1 = failure) */
  exitCode: 0 | 1
  /** Exit Message (success = empty) */
  exitMessage: string
  /** Action Outputs */
  outputs: { [key: string]: string }
  /** Registered Secrets */
  secrets: string[]
  /** Actions Step Debug Enabled */
  stepDebug: boolean
  /** Action State */
  state: { [key: string]: string }
  /**
   * Output Colors
   *
   * This is not part of `@actions/core` but is included here for convenience
   * when calling related functions.
   */
  colors: {
    [key: string]: (message: string) => void
  }
  /**
   * Step Summary Output File Path
   *
   * This is not part of `@actions/core` but is included here for convenience
   * when calling related functions.
   */
  stepSummaryPath: string
}

/** Action Properties */
export type Action = {
  /** Name */
  name: string
  /** Author */
  author?: string
  /** Description */
  description: string
  /** Inputs */
  inputs: Record<string, Input>
  /** Outputs */
  outputs: Record<string, Output>
  /** Entrypoint Configuration */
  runs: Runs
}

/** Input Properties */
export type Input = {
  /** Description */
  description: string
  /** Required */
  required?: boolean
  /** Default ValuE */
  default?: string
  /** Deprecation Message */
  deprecationMessage?: string
}

/** Output Properties */
export type Output = {
  /** Description of the output */
  description: string
}

/** Entrypoint Properties */
export type Runs = {
  /** Type of Entrypoint */
  using: string
  /** Entrypoint Script */
  main: string
  /** Pre Script */
  pre?: string
  /** Pre Script Conditions */
  'pre-if'?: () => boolean
  /** Post Script */
  post?: string
  /** Post Script Conditions */
  'post-if'?: () => boolean
}
