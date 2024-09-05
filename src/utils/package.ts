import fs from 'fs'
import { dirname, join } from 'path'
import { EnvMeta } from '../stubs/env-stubs.js'

/**
 * Checks if the JavaScript/TypeScript project is an ESM module.
 *
 * @returns True if the project is an ESM module, false otherwise.
 */
export function isESM(): boolean {
  // Starting at this directory, walk up the directory tree until we find a
  // package.json file.
  /* istanbul ignore next */
  const dirs =
    dirname(EnvMeta.entrypoint).split('/') || // Unix
    dirname(EnvMeta.entrypoint).split('\\') || // Windows
    []
  while (dirs.length > 0) {
    // Check if the current directory has a packge.json.
    if (fs.existsSync(join(...dirs, 'package.json'))) {
      const packageJson = JSON.parse(
        fs.readFileSync(join(...dirs, 'package.json'), 'utf8')
      ) as { [key: string]: any }

      return packageJson.type === 'module'
    }

    // Move up the directory tree.
    dirs.pop()
  }

  // If we reach the root directory and still haven't found a package.json
  // file, assume that the project is not an ESM module.
  /* istanbul ignore next */
  return false
}
