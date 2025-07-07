import path from 'path'
import { EnvMeta } from '../stubs/env.js'

/**
 * Get OS Action Entrypoints
 *
 * The entrypoint is OS-specific. On Windows, it has to start with a leading
 * slash, then the drive letter, followed by the rest of the path. In both
 * cases, the path separators are converted to forward slashes.
 *
 * On Windows, the entrypoint requires a leading slash if the action is ESM.
 * Otherwise, it can be omitted.
 *
 * @param actionType Action Type (esm | cjs)
 * @returns Object with main, pre, and post entrypoints
 */
export function getOSEntrypoints(actionType: 'esm' | 'cjs'): {
  main: string
  pre: string | undefined
  post: string | undefined
} {
  return {
    main:
      process.platform !== 'win32'
        ? path.resolve(EnvMeta.entrypoint)
        : /* istanbul ignore next */
          actionType === 'esm'
          ? '/' + path.resolve(EnvMeta.entrypoint)
          : path.resolve(EnvMeta.entrypoint.replaceAll(path.sep, '/')),
    pre: EnvMeta.preEntrypoint
      ? process.platform !== 'win32'
        ? path.resolve(EnvMeta.preEntrypoint)
        : /* istanbul ignore next */
          actionType === 'esm'
          ? '/' + path.resolve(EnvMeta.preEntrypoint)
          : path.resolve(EnvMeta.preEntrypoint.replaceAll(path.sep, '/'))
      : undefined,
    post: EnvMeta.postEntrypoint
      ? process.platform !== 'win32'
        ? path.resolve(EnvMeta.postEntrypoint)
        : /* istanbul ignore next */
          actionType === 'esm'
          ? '/' + path.resolve(EnvMeta.postEntrypoint)
          : path.resolve(EnvMeta.postEntrypoint.replaceAll(path.sep, '/'))
      : undefined
  }
}
