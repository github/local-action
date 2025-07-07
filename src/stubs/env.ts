import type { EnvMetadata } from '../types.js'

/**
 * Environment Metdata
 */
export const EnvMeta: EnvMetadata = {
  actionFile: '',
  actionPath: '',
  artifacts: [],
  dotenvFile: '',
  entrypoint: '',
  env: {},
  inputs: {},
  outputs: {},
  path: '',
  postEntrypoint: undefined,
  preEntrypoint: undefined
}

/**
 * Reset the Environment Metadata
 *
 * Simple convenience function to reset the environment metadata back to initial
 * state.
 */
export function ResetEnvMetadata(): void {
  EnvMeta.actionFile = ''
  EnvMeta.actionPath = ''
  EnvMeta.artifacts = []
  EnvMeta.dotenvFile = ''
  EnvMeta.entrypoint = ''
  EnvMeta.env = {}
  EnvMeta.inputs = {}
  EnvMeta.outputs = {}
  EnvMeta.path = ''
  EnvMeta.postEntrypoint = undefined
  EnvMeta.preEntrypoint = undefined
}
