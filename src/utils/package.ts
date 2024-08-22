import fs from 'fs'
import { EnvMeta } from '../stubs/env-stubs.js'

/**
 * Checks if the JavaScript/TypeScript project is an ESM module.
 *
 * @returns True if the project is an ESM module, false otherwise.
 */
export function isESM(): boolean {
  const packageJson = JSON.parse(
    fs.readFileSync(`${EnvMeta.actionPath}/package.json`, {
      encoding: 'utf8',
      flag: 'r'
    })
  ) as { type: string }

  return packageJson.type === 'module'
}
