import fs from 'fs'
import * as path from 'path'
import { EnvMeta } from '../stubs/env.js'

/**
 * Checks if the JavaScript/TypeScript project is an ESM module.
 *
 * @returns True if the project is an ESM module, false otherwise.
 */
export function isESM(): boolean {
  // Starting at this directory, walk up the directory tree until we find a
  // package.json file.
  const dirs = path.dirname(EnvMeta.entrypoint).split(path.sep)

  while (dirs.length > 0) {
    // Check if the current directory has a packge.json.
    if (fs.existsSync(path.resolve(dirs.join(path.sep), 'package.json'))) {
      const packageJson = JSON.parse(
        fs.readFileSync(
          path.resolve(dirs.join(path.sep), 'package.json'),
          'utf8'
        )
      ) as { [key: string]: unknown }

      return packageJson.type === 'module'
    }

    // Move up the directory tree.
    /* istanbul ignore next */
    dirs.pop()
  }

  // If we reach the root directory and still haven't found a package.json
  // file, assume that the project is not an ESM module.
  /* istanbul ignore next */
  return false
}
