import { jest } from '@jest/globals'
import * as exec from '../../../__fixtures__/@actions/exec.js'

jest.unstable_mockModule('@actions/exec', () => exec)

const platform = await import('../../../src/stubs/core/platform.js')

describe('platform', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getWindowsInfo', () => {
    it('Gets Windows OS info', async () => {
      exec.getExecOutput
        .mockResolvedValueOnce({
          stdout: '10',
          stderr: '',
          exitCode: 0
        } as never)
        .mockResolvedValueOnce({
          stdout: 'Microsoft Windows 10 Pro',
          stderr: '',
          exitCode: 0
        } as never)

      const result = await platform.getWindowsInfo()

      expect(exec.getExecOutput).toHaveBeenCalledTimes(2)
      expect(result).toMatchObject({
        name: 'Microsoft Windows 10 Pro',
        version: '10'
      })
    })
  })

  describe('getMacOsInfo', () => {
    it('Gets macOS info', async () => {
      exec.getExecOutput.mockResolvedValueOnce({
        stdout:
          'ProductName:    macOS\nProductVersion: 13.0.1\nBuildVersion:   22A400',
        stderr: '',
        exitCode: 0
      } as never)

      const result = await platform.getMacOsInfo()

      expect(exec.getExecOutput).toHaveBeenCalledTimes(1)
      expect(result).toMatchObject({
        name: 'macOS',
        version: '13.0.1'
      })
    })

    it('Gets macOS info (defaults to empty strings)', async () => {
      exec.getExecOutput.mockResolvedValueOnce({
        stdout: '',
        stderr: '',
        exitCode: 0
      } as never)

      const result = await platform.getMacOsInfo()

      expect(exec.getExecOutput).toHaveBeenCalledTimes(1)
      expect(result).toMatchObject({
        name: '',
        version: ''
      })
    })
  })

  describe('getLinuxInfo', () => {
    it('Gets Linux OS info', async () => {
      exec.getExecOutput.mockResolvedValueOnce({
        stdout: 'Linux\nMint',
        stderr: '',
        exitCode: 0
      } as never)

      const result = await platform.getLinuxInfo()

      expect(exec.getExecOutput).toHaveBeenCalledTimes(1)
      expect(result).toMatchObject({
        name: 'Linux',
        version: 'Mint'
      })
    })
  })
})
