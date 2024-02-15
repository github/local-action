import type { EnvMetadata } from '../types'

/**
 * Environment Metdata
 */
export const EnvMeta: EnvMetadata = {
  actionFile: '',
  actionPath: '',
  dotenvFile: '',
  entrypoint: '',
  env: {},
  envBackup: {},
  inputs: {},
  outputs: {},
  path: '',
  pathBackup: ''
}

/**
 * Resets the environment metadata
 */
export function ResetEnvMetadata(): void {
  EnvMeta.actionFile = ''
  EnvMeta.actionPath = ''
  EnvMeta.dotenvFile = ''
  EnvMeta.entrypoint = ''
  EnvMeta.env = {}
  EnvMeta.envBackup = {}
  EnvMeta.inputs = {}
  EnvMeta.outputs = {}
  EnvMeta.path = ''
  EnvMeta.pathBackup = ''
}
