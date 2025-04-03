/**
 * Last Reviewed Commit: https://github.com/actions/toolkit/blob/930c89072712a3aac52d74b23338f00bb0cfcb24/packages/core/src/platform.ts
 */

import * as exec from '@actions/exec'
import os from 'os'

/**
 * Gets the Windows version and name.
 *
 * @remarks
 *
 * - Exported for testing purposes.
 *
 * @returns Promise with the Windows version and name
 */
export const getWindowsInfo = async (): Promise<{
  name: string
  version: string
}> => {
  const { stdout: version } = await exec.getExecOutput(
    'powershell -command "(Get-CimInstance -ClassName Win32_OperatingSystem).Version"',
    undefined,
    {
      silent: true
    }
  )

  const { stdout: name } = await exec.getExecOutput(
    'powershell -command "(Get-CimInstance -ClassName Win32_OperatingSystem).Caption"',
    undefined,
    {
      silent: true
    }
  )

  return {
    name: name.trim(),
    version: version.trim()
  }
}

/**
 * Gets the macOS version and name.
 *
 * @remarks
 *
 * - Exported for testing purposes.
 *
 * @returns Promise with the macOS version and name
 */
export const getMacOsInfo = async (): Promise<{
  name: string
  version: string
}> => {
  const { stdout } = await exec.getExecOutput('sw_vers', undefined, {
    silent: true
  })

  const version = stdout.match(/ProductVersion:\s*(.+)/)?.[1] ?? ''
  const name = stdout.match(/ProductName:\s*(.+)/)?.[1] ?? ''

  return {
    name,
    version
  }
}

/**
 * Gets the Linux version and name.
 *
 * @remarks
 *
 * - Exported for testing purposes.
 *
 * @returns Promise with the Linux version and name
 */
export const getLinuxInfo = async (): Promise<{
  name: string
  version: string
}> => {
  const { stdout } = await exec.getExecOutput(
    'lsb_release',
    ['-i', '-r', '-s'],
    {
      silent: true
    }
  )

  const [name, version] = stdout.trim().split('\n')

  return {
    name,
    version
  }
}

export const platform = os.platform()
export const arch = os.arch()
export const isWindows = platform === 'win32'
export const isMacOS = platform === 'darwin'
export const isLinux = platform === 'linux'

/**
 * Gets the platform details.
 *
 * @returns Promise with the platform details
 */
/* istanbul ignore next */
export async function getDetails(): Promise<{
  name: string
  platform: string
  arch: string
  version: string
  isWindows: boolean
  isMacOS: boolean
  isLinux: boolean
}> {
  return {
    ...(await (isWindows
      ? getWindowsInfo()
      : isMacOS
        ? getMacOsInfo()
        : getLinuxInfo())),
    platform,
    arch,
    isWindows,
    isMacOS,
    isLinux
  }
}
