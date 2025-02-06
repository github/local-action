import { jest } from '@jest/globals'
import path from 'path'
import { Context } from '../../../src/stubs/github/context.js'

let envBackup: NodeJS.ProcessEnv

describe('github/context', () => {
  beforeEach(() => {
    envBackup = process.env
    process.env.GITHUB_REPOSITORY = 'github/local-action'
  })

  afterEach(() => {
    process.env = envBackup
    jest.resetAllMocks()
  })

  describe('Context', () => {
    it('Creates a Context object', () => {
      const context = new Context()
      expect(context).toBeInstanceOf(Context)
    })

    it('Gets the event payload', () => {
      process.env.GITHUB_EVENT_PATH = path.join(
        process.cwd(),
        '__fixtures__',
        'payloads',
        'issue_opened.json'
      )

      const context = new Context()
      expect(context.payload.action).toBe('opened')
    })

    it('Does not get the event payload if the path does not exist', () => {
      process.env.GITHUB_EVENT_PATH = path.join(
        process.cwd(),
        '__fixtures__',
        'payloads',
        'does_not_exist.json'
      )

      const context = new Context()
      expect(context.payload.action).toBeUndefined()
    })

    it('Gets the issue payload', () => {
      process.env.GITHUB_EVENT_PATH = path.join(
        process.cwd(),
        '__fixtures__',
        'payloads',
        'issue_opened.json'
      )

      const context = new Context()
      expect(context.issue.number).toBe(1)
    })

    it('Gets the repo payload', () => {
      process.env.GITHUB_EVENT_PATH = path.join(
        process.cwd(),
        '__fixtures__',
        'payloads',
        'issue_opened.json'
      )

      const context = new Context()
      expect(context.repo.owner).toBe('github')
      expect(context.repo.repo).toBe('local-action')
    })
  })
})
