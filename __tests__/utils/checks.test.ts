/**
 * Unit tests for the tool's validation utilities
 */

import { expect } from 'chai'
import { restore } from 'sinon'

import * as checks from '../../src/utils/checks'
import { ResetEnvMetadata } from '../../src/stubs/env'
import { ResetCoreMetadata } from '../../src/stubs/core'

describe('checkActionPath', () => {
  beforeEach(() => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  it('Throws if the path is not a directory', () => {
    expect(() => checks.checkActionPath('package.json')).to.throw()
  })

  it('Throws if the path does not exist', () => {
    expect(() => checks.checkActionPath('test/path/does/not/exist')).to.throw()
  })

  it('Throws if the path does not contain an action.yml file', () => {
    expect(() => checks.checkActionPath('./__tests__/fixtures')).to.throw()
  })
})

describe('checkEntryPoint', () => {
  it('Throws if the entrypoint does not exist', () => {
    expect(() => checks.checkEntryPoint('index.js')).to.throw()
  })
})

describe('checkEnvFile', () => {
  it('Throws if the env file does not exist', () => {
    expect(() => checks.checkEnvFile('test.env')).to.throw()
  })
})
