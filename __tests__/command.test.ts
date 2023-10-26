/**
 * Unit tests for the tool's command utility
 */

import { expect } from 'chai'
import { Command } from 'commander'
import { restore, stub } from 'sinon'

import * as command from '../src/command'
import * as main from '../src/commands/run'
import { ResetEnvMetadata } from '../src/stubs/env'
import { ResetCoreMetadata } from '../src/stubs/core'

describe('Commmand', () => {
  beforeEach(() => {
    ResetEnvMetadata()
    ResetCoreMetadata()
  })
  afterEach(() => {
    restore()
  })

  it('Returns a program object', () => {
    const program = command.makeProgram()

    expect(program).to.not.be.null
    expect(program).to.be.instanceOf(Command)
  })

  it('Has a run command', () => {
    const program = command.makeProgram()
    const cmd = program.commands.find(c => c.name() === 'run')

    expect(cmd).to.not.be.undefined
    expect(cmd).to.be.instanceOf(Command)
  })

  it('Exits if no path arg is provided', () => {
    const exitStub = stub(process, 'exit').callsFake(() => {
      throw new Error('Process exited')
    })

    command.makeProgram().parseAsync()

    expect(exitStub.calledOnce).to.be.true
  })

  it('Exits if no entrypoint arg is provided', () => {
    const exitStub = stub(process, 'exit').callsFake(() => {
      throw new Error('Process exited')
    })

    command
      .makeProgram()
      .parseAsync(['./__tests__/fixtures/success', ''], { from: 'user' })

    expect(exitStub.calledOnce).to.be.true
  })

  it('Exits if no env file arg is provided', () => {
    const exitStub = stub(process, 'exit').callsFake(() => {
      throw new Error('Process exited')
    })

    command
      .makeProgram()
      .parseAsync(['./__tests__/fixtures/success', 'src/index.ts'], {
        from: 'user'
      })

    expect(exitStub.calledOnce).to.be.true
  })

  it('Runs if all args are provided', () => {
    const runStub = stub(main, 'run').callsFake(async () => {})
    const exitStub = stub(process, 'exit').callsFake(() => {
      throw new Error('Process exited')
    })

    command
      .makeProgram()
      .parseAsync(
        [
          './__tests__/fixtures/success',
          'src/index.ts',
          './__tests__/fixtures/success/.env.fixture'
        ],
        {
          from: 'user'
        }
      )

    expect(exitStub.calledOnce).to.be.false
    expect(runStub.calledOnce).to.be.true
  })
})
