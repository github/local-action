/* eslint-disable import/no-namespace */

import { setFailed, summary } from '@actions/core'
import { action } from '../../src/commands/run'
import { ResetCoreMetadata } from '../../src/stubs/core-stubs'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env-stubs'
import * as output from '../../src/utils/output'

const summary_writeSpy: jest.SpyInstance = jest
  .spyOn(summary, 'write')
  .mockImplementation()

let envBackup: { [key: string]: string | undefined } = process.env

describe('Command: run', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
    jest.spyOn(output, 'printTitle').mockImplementation()
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

    // Restore environment variables
    process.env = envBackup
  })

  describe('TypeScript', () => {
    it('Action: success', async () => {
      EnvMeta.actionFile = `./__fixtures__/typescript/success/action.yml`
      EnvMeta.actionPath = `./__fixtures__/typescript/success`
      EnvMeta.dotenvFile = `./__fixtures__/typescript/success/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/typescript/success/src/index.ts`

      await expect(action()).resolves.toBeUndefined()

      expect(summary_writeSpy).toHaveBeenCalled()
      expect(setFailed).not.toHaveBeenCalled()
    })

    it('Action: failure', async () => {
      EnvMeta.actionFile = `./__fixtures__/typescript/failure/action.yml`
      EnvMeta.actionPath = `./__fixtures__/typescript/failure`
      EnvMeta.dotenvFile = `./__fixtures__/typescript/failure/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/typescript/failure/src/index.ts`

      await expect(action()).resolves.toBeUndefined()

      expect(summary_writeSpy).toHaveBeenCalled()
      expect(setFailed).toHaveBeenCalledWith('TypeScript Action Failed!')
    })

    it('Action: no-import', async () => {
      EnvMeta.actionFile = `./__fixtures__/typescript/no-import/action.yml`
      EnvMeta.actionPath = `./__fixtures__/typescript/no-import`
      EnvMeta.dotenvFile = `./__fixtures__/typescript/no-import/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/typescript/no-import/src/index.ts`

      await expect(action()).resolves.toBeUndefined()

      expect(summary_writeSpy).not.toHaveBeenCalled()
      expect(setFailed).not.toHaveBeenCalled()
    })
  })

  describe('JavaScript', () => {
    it('Action: success', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/success/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/success`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/success/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/success/src/index.js`

      await expect(action()).resolves.toBeUndefined()

      expect(summary_writeSpy).toHaveBeenCalled()
      expect(setFailed).not.toHaveBeenCalled()
    })

    it('Action: failure', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/failure/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/failure`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/failure/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/failure/src/index.js`

      await expect(action()).resolves.toBeUndefined()

      expect(summary_writeSpy).toHaveBeenCalled()
      expect(setFailed).toHaveBeenCalled()
    })

    it('Action: no-import', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/no-import/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/no-import`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/no-import/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/no-import/src/index.js`

      await expect(action()).resolves.toBeUndefined()

      expect(summary_writeSpy).not.toHaveBeenCalled()
      expect(setFailed).not.toHaveBeenCalled()
    })
  })
})
