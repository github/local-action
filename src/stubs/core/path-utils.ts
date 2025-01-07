import * as path from 'path'

/**
 * @github/local-action Unmodified
 *
 * Converts the given path to the posix form. On Windows, `\\` will be replaced
 * with `/`.
 *
 * @param pth Path to transform
 * @return Posix path
 */
export function toPosixPath(pth: string): string {
  return pth.replace(/[\\]/g, '/')
}

/**
 * @github/local-action Unmodified
 *
 * Converts the given path to the win32 form. On Linux, `/` will be replaced
 * with `\\`.
 *
 * @param pth Path to transform
 * @return Win32 path
 */
export function toWin32Path(pth: string): string {
  return pth.replace(/[/]/g, '\\')
}

/**
 * @github/local-action Unmodified
 *
 * Converts the given path to a platform-specific path. It does this by
 * replacing instances of `/` and `\` with the platform-specific path separator.
 *
 * @param pth The path to platformize
 * @return The platform-specific path
 */
export function toPlatformPath(pth: string): string {
  return pth.replace(/[/\\]/g, path.sep)
}
