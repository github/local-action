/**
 * Load environment variables from a `.env` file
 */
import { EnvMetadata } from '../interfaces'

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
