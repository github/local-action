import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import { ResetCoreMetadata } from '../../src/stubs/core/core.js'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env.js'

const quibbleEsm = jest.fn().mockImplementation(() => {})
const quibbleDefault = jest.fn().mockImplementation(() => {})

// Stub console.log to reduce noise
console.log = jest.fn().mockImplementation(() => {})

// @ts-expect-error - `quibble` is the default, but we need to mock esm() too
quibbleDefault.esm = quibbleEsm

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('quibble', () => {
  return { default: quibbleDefault }
})
jest.unstable_mockModule('../../src/utils/output.js', () => {
  return { printTitle: jest.fn() }
})

const { action } = await import('../../src/commands/run.js')

// Prevent output during tests
// jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'table').mockImplementation(() => {})

describe('Command: run', () => {
  beforeEach(() => {
    // Reset metadata
    ResetEnvMetadata()
    ResetCoreMetadata()
  })

  afterEach(() => {
    // Reset all spies
    jest.resetAllMocks()
  })

  describe('TypeScript ESM', () => {
    it('TypeScript ESM Action: success', async () => {
      EnvMeta.actionFile = `./__fixtures__/typescript-esm/success/action.yml`
      EnvMeta.actionPath = `./__fixtures__/typescript-esm/success`
      EnvMeta.dotenvFile = `./__fixtures__/typescript-esm/success/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/typescript-esm/success/src/main.ts`

      await expect(action()).resolves.toBeUndefined()

      expect(core.setFailed).not.toHaveBeenCalled()
      expect(quibbleEsm).toHaveBeenCalled()
    })

    it('TypeScript ESM Action: no-import', async () => {
      EnvMeta.actionFile = `./__fixtures__/typescript-esm/no-import/action.yml`
      EnvMeta.actionPath = `./__fixtures__/typescript-esm/no-import`
      EnvMeta.dotenvFile = `./__fixtures__/typescript-esm/no-import/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/typescript-esm/no-import/src/main.ts`

      await expect(action()).resolves.toBeUndefined()

      expect(core.setFailed).not.toHaveBeenCalled()
      expect(quibbleEsm).toHaveBeenCalled()
    })

    it('TypeScript ESM Action: Throws if run is not exported', async () => {
      EnvMeta.actionFile = `./__fixtures__/typescript-esm/no-export/action.yml`
      EnvMeta.actionPath = `./__fixtures__/typescript-esm/no-export`
      EnvMeta.dotenvFile = `./__fixtures__/typescript-esm/no-export/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/typescript-esm/no-export/src/main.ts`

      await expect(action()).rejects.toThrow(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )
    })
  })

  describe('JavaScript', () => {
    it('JavaScript Action: success', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/success/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/success`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/success/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/success/src/main.js`

      await expect(action()).resolves.toBeUndefined()
    })

    it('JavaScript Action: no-import', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/no-import/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/no-import`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/no-import/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/no-import/src/main.js`

      await expect(action()).resolves.toBeUndefined()
    })

    it('JavaScript Action: Throws if run is not exported', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/no-export/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/no-export`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/no-export/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/no-export/src/main.js`

      await expect(action()).rejects.toThrow(
        `Entrypoint ${EnvMeta.entrypoint} does not export a run() function`
      )
    })
  })

  describe('JavaScript (ESM)', () => {
    it('JavaScript ESM Action: success', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/success/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/success`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/success/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/success/src/main.js`

      await expect(action()).resolves.toBeUndefined()

      expect(quibbleDefault).toHaveBeenCalled()
    })

    it('JavaScript ESM Action: no-import', async () => {
      EnvMeta.actionFile = `./__fixtures__/javascript/no-import/action.yml`
      EnvMeta.actionPath = `./__fixtures__/javascript/no-import`
      EnvMeta.dotenvFile = `./__fixtures__/javascript/no-import/.env.fixture`
      EnvMeta.entrypoint = `./__fixtures__/javascript/no-import/src/main.js`

      await expect(action()).resolves.toBeUndefined()

      expect(quibbleDefault).toHaveBeenCalled()
    })
  })
})
