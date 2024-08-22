import type { EnvMetadata } from '../types.js'

/**
 * Environment Metdata
 */
export const EnvMeta: EnvMetadata = {
  actionFile: '',
  actionPath: '',
  dotenvFile: '',
  entrypoint: '',
  env: {},
  inputs: {},
  outputs: {},
  path: ''
}

/**
 * Resets the environment metadata
 *
 * @returns void
 */
export function ResetEnvMetadata(): void {
  EnvMeta.actionFile = ''
  EnvMeta.actionPath = ''
  EnvMeta.dotenvFile = ''
  EnvMeta.entrypoint = ''
  EnvMeta.env = {}
  EnvMeta.inputs = {}
  EnvMeta.outputs = {}
  EnvMeta.path = ''
}
