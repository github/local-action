/**
 * Unit tests for the tool's output printing utilities
 */

import { expect } from 'chai'
import { restore, stub } from 'sinon'

import * as output from '../../src/utils/output'
import { ResetEnvMetadata } from '../../src/stubs/env'
import { ResetCoreMetadata } from '../../src/stubs/core'

describe('printTitle', () => {
  beforeEach(() => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  it('Prints the correct number of (=) signs', () => {
    // Stub console.log to ignore the actual output
    const consoleSpy = stub(console, 'log')

    output.printTitle(console.log, 'Test')

    expect(consoleSpy.calledThrice).to.be.true
    expect(consoleSpy.firstCall.calledWith('='.repeat(80))).to.be.true
    expect(consoleSpy.secondCall.calledWith(`${' '.repeat(38)}Test`)).to.be.true
    expect(consoleSpy.thirdCall.calledWith('='.repeat(80))).to.be.true
  })
})
