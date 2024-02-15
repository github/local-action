import fs from 'fs'
import { ResetCoreMetadata } from '../src/stubs/core-stubs'
import { ResetEnvMetadata } from '../src/stubs/env-stubs'

let envBackup: { [key: string]: string | undefined } = process.env

let fs_existsSyncSpy: jest.SpyInstance
let fs_readFileSyncSpy: jest.SpyInstance

describe('Bootstrap', () => {
  beforeAll(() => {
    fs_existsSyncSpy = jest.spyOn(fs, 'existsSync')
    fs_readFileSyncSpy = jest.spyOn(fs, 'readFileSync')
  })

  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()

    // Back up environment variables
    envBackup = process.env
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()

    // Reset module imports
    jest.resetModules()

    // Restore environment variables
    process.env = envBackup
  })

  it('Does nothing if no target action path is provided', async () => {
    process.env.TARGET_ACTION_PATH = ''

    await import('../src/bootstrap')

    expect(fs_existsSyncSpy).not.toHaveBeenCalledWith(
      `${process.env.TARGET_ACTION_PATH}/tsconfig.json`
    )
    expect(fs_readFileSyncSpy).not.toHaveBeenCalledWith(
      `${process.env.TARGET_ACTION_PATH}/tsconfig.json`
    )
  })

  it('Does nothing if the target action path does not exist', async () => {
    process.env.TARGET_ACTION_PATH = 'non-existent-path'

    await import('../src/bootstrap')

    expect(fs_existsSyncSpy).toHaveBeenCalledWith(
      `${process.env.TARGET_ACTION_PATH}/tsconfig.json`
    )
    expect(fs_readFileSyncSpy).not.toHaveBeenCalledWith(
      `${process.env.TARGET_ACTION_PATH}/tsconfig.json`
    )
  })
})
