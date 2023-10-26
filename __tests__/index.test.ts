/**
 * Unit tests for the tool's entrypoint
 */

import { expect } from 'chai'
import { restore, stub } from 'sinon'

import * as command from '../src/command'
import { ResetEnvMetadata } from '../src/stubs/env'
import { ResetCoreMetadata } from '../src/stubs/core'
import { Command } from 'commander'

describe('Index', () => {
  beforeEach(async () => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  it('tests', () => {
    expect(true).to.be.true
  })

  it('Creates and runs the program', async () => {
    //stub(console, 'log')
    stub(console, 'table')

    const programStub = stub(command, 'makeProgram').callsFake(() => {
      return {
        parse: () => {}
      } as Command
    })

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const run = require('../src/index')

    await run.default()
    expect(programStub.calledOnce).to.be.true
  })
})
