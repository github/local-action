import type { EnvMetadata } from '../types'

/**
 * Environment Metdata
 */
export const EnvMeta: EnvMetadata = {
  actionFile: '',
  actionPath: '',
  entrypoint: '',
  env: {},
  envBackup: {},
  envFile: '',
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
  EnvMeta.entrypoint = ''
  EnvMeta.env = {}
  EnvMeta.envBackup = {}
  EnvMeta.envFile = ''
  EnvMeta.inputs = {}
  EnvMeta.outputs = {}
  EnvMeta.path = ''
  EnvMeta.pathBackup = ''
}
