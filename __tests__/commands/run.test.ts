/**
 * Unit tests for the tool's run command
 */

import { expect } from 'chai'
import { SinonSpy, SinonStub, spy, stub } from 'sinon'
import { config } from 'dotenv'

import * as main from '../../src/commands/run'
import * as output from '../../src/utils/output'
import { EnvMeta, ResetEnvMetadata } from '../../src/stubs/env'
import { ResetCoreMetadata } from '../../src/stubs/core'

describe('run', () => {
  describe('Successful tests', () => {
    let titleStub: SinonStub
    let tableStub: SinonStub
    let runSpy: SinonSpy

    beforeEach(async () => {
      ResetCoreMetadata()
      ResetEnvMetadata()

      runSpy = spy(main, 'run')
      titleStub = stub(output, 'printTitle')
      tableStub = stub(console, 'table')
    })
    afterEach(() => {
      runSpy.restore()
      titleStub.restore()
      tableStub.restore()
    })

    it('Prints the configuration', () => {
      EnvMeta.actionFile = './__tests__/fixtures/success/action.yml'
      EnvMeta.actionPath = './__tests__/fixtures/success'
      EnvMeta.entrypoint = './__tests__/fixtures/success/src/index.ts'
      EnvMeta.envFile = './__tests__/fixtures/success/.env.fixture'

      // eslint-disable-next-line github/no-then
      main.run().then(() => {
        expect(titleStub.calledOnce).to.be.true
        expect(
          tableStub.calledOnceWith([
            {
              Field: 'Action Path',
              Value: './__tests__/fixtures/success'
            },
            {
              Field: 'Entrypoint',
              Value: './__tests__/fixtures/success/src/index.ts'
            },
            {
              Field: 'Environment File',
              Value: './__tests__/fixtures/success/.env.fixture'
            }
          ])
        )
      })
    })

    it('Loads the environment file', () => {
      EnvMeta.actionFile = './__tests__/fixtures/success/action.yml'
      EnvMeta.actionPath = './__tests__/fixtures/success'
      EnvMeta.entrypoint = './__tests__/fixtures/success/src/index.ts'
      EnvMeta.envFile = './__tests__/fixtures/success/.env.fixture'

      const configSpy = spy(config)

      // eslint-disable-next-line github/no-then
      main.run().then(() => {
        expect(
          configSpy.calledOnceWith({
            path: './__tests__/fixtures/success/.env.fixture'
          })
        ).to.be.true
      })
    })

    it('Sets empty environment action metadata when not present', () => {
      EnvMeta.actionFile = './__tests__/fixtures/empty-meta/action.yml'
      EnvMeta.actionPath = './__tests__/fixtures/empty-meta'
      EnvMeta.entrypoint = './__tests__/fixtures/empty-meta/src/index.ts'
      EnvMeta.envFile = './__tests__/fixtures/empty-meta/.env.fixture'

      // eslint-disable-next-line github/no-then
      main.run().then(() => {
        expect(EnvMeta.inputs).to.deep.equal({})
        expect(EnvMeta.outputs).to.deep.equal({})
      })
    })
  })
})
