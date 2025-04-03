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
  path: ''
}

/**
 * Resets the environment metadata
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
}
