import * as core from '@actions/core'
import * as run from '../../src/commands/run'
import * as coreStubs from '../../src/stubs/core-stubs'
import * as envStubs from '../../src/stubs/env-stubs'
import * as output from '../../src/utils/output'

// eslint-disable-next-line no-undef
let envBackup: NodeJS.ProcessEnv = process.env

describe('Command: run', () => {
  beforeAll(() => {
    // Prevent output during tests
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'table').mockImplementation()
    jest.spyOn(output, 'printTitle').mockImplementation()
  })

  beforeEach(() => {
    // Reset metadata
    envStubs.ResetEnvMetadata()
    coreStubs.ResetCoreMetadata()

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
      envStubs.EnvMeta.actionFile = `./__fixtures__/typescript/success/action.yml`
      envStubs.EnvMeta.actionPath = `./__fixtures__/typescript/success`
      envStubs.EnvMeta.entrypoint = `./__fixtures__/typescript/success/src/index.ts`
      envStubs.EnvMeta.envFile = `./__fixtures__/typescript/success/.env.fixture`

      await expect(run.action()).resolves.toBeUndefined()
      expect(core.setFailed).not.toHaveBeenCalled()
    })

    it('Action: failure', async () => {
      envStubs.EnvMeta.actionFile = `./__fixtures__/typescript/failure/action.yml`
      envStubs.EnvMeta.actionPath = `./__fixtures__/typescript/failure`
      envStubs.EnvMeta.entrypoint = `./__fixtures__/typescript/failure/src/index.ts`
      envStubs.EnvMeta.envFile = `./__fixtures__/typescript/failure/.env.fixture`

      await expect(run.action()).resolves.toBeUndefined()
      expect(core.setFailed).toHaveBeenCalledWith('TypeScript Action Failed!')
    })

    it('Action: no-import', async () => {
      envStubs.EnvMeta.actionFile = `./__fixtures__/typescript/no-import/action.yml`
      envStubs.EnvMeta.actionPath = `./__fixtures__/typescript/no-import`
      envStubs.EnvMeta.entrypoint = `./__fixtures__/typescript/no-import/src/index.ts`
      envStubs.EnvMeta.envFile = `./__fixtures__/typescript/no-import/.env.fixture`

      await expect(run.action()).resolves.toBeUndefined()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })

  describe('JavaScript', () => {
    it('Action: success', async () => {
      envStubs.EnvMeta.actionFile = `./__fixtures__/javascript/success/action.yml`
      envStubs.EnvMeta.actionPath = `./__fixtures__/javascript/success`
      envStubs.EnvMeta.entrypoint = `./__fixtures__/javascript/success/src/index.js`
      envStubs.EnvMeta.envFile = `./__fixtures__/javascript/success/.env.fixture`

      await expect(run.action()).resolves.toBeUndefined()
      expect(core.setFailed).not.toHaveBeenCalled()
    })

    it('Action: failure', async () => {
      envStubs.EnvMeta.actionFile = `./__fixtures__/javascript/failure/action.yml`
      envStubs.EnvMeta.actionPath = `./__fixtures__/javascript/failure`
      envStubs.EnvMeta.entrypoint = `./__fixtures__/javascript/failure/src/index.js`
      envStubs.EnvMeta.envFile = `./__fixtures__/javascript/failure/.env.fixture`

      await expect(run.action()).resolves.toBeUndefined()
      expect(core.setFailed).toHaveBeenCalled()
    })

    it('Action: no-import', async () => {
      envStubs.EnvMeta.actionFile = `./__fixtures__/javascript/no-import/action.yml`
      envStubs.EnvMeta.actionPath = `./__fixtures__/javascript/no-import`
      envStubs.EnvMeta.entrypoint = `./__fixtures__/javascript/no-import/src/index.js`
      envStubs.EnvMeta.envFile = `./__fixtures__/javascript/no-import/.env.fixture`

      await expect(run.action()).resolves.toBeUndefined()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })
})
