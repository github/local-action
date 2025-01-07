import { jest } from '@jest/globals'
import fs from 'fs'
import { EOL } from 'os'
import path from 'path'
import { CoreMeta, ResetCoreMetadata } from '../../../src/stubs/core/core.js'
import { Summary } from '../../../src/stubs/core/summary.js'

let summary: Summary = new Summary()

// Prevent output during tests
jest.spyOn(console, 'log').mockImplementation(() => {})

describe('Summary', () => {
  beforeEach(() => {
    // Reset the summary instance
    summary = new Summary()

    CoreMeta.stepSummaryPath = 'summary.md'
  })

  afterEach(() => {
    jest.resetAllMocks()

    // Restore environment metadata
    ResetCoreMetadata()
  })

  describe('constructor', () => {
    it('Creates an instance of the Summary class', () => {
      expect(summary).toBeInstanceOf(Summary)
    })
  })

  describe('filePath()', () => {
    let fs_accessSyncSpy: jest.SpiedFunction<typeof fs.accessSync>
    let fs_existsSyncSpy: jest.SpiedFunction<typeof fs.existsSync>
    let path_resolveSpy: jest.SpiedFunction<typeof path.resolve>

    beforeEach(() => {
      fs_accessSyncSpy = jest
        .spyOn(fs, 'accessSync')
        .mockImplementation(() => {})
      fs_existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      path_resolveSpy = jest
        .spyOn(path, 'resolve')
        .mockReturnValueOnce('/path/to/summary.md')
    })

    afterEach(() => {
      fs_accessSyncSpy.mockRestore()
      fs_existsSyncSpy.mockRestore()
      path_resolveSpy.mockRestore()
    })

    it('Resolves the summary file path from the environment', async () => {
      await expect(summary.filePath()).resolves.toBe('/path/to/summary.md')

      expect(fs_accessSyncSpy).toHaveBeenCalledWith(
        '/path/to/summary.md',
        fs.constants.R_OK | fs.constants.W_OK
      )
    })

    it('Returns the already-resolved file path', async () => {
      await summary.filePath()
      await summary.filePath()
      await summary.filePath()

      expect(fs_accessSyncSpy).toHaveBeenCalledTimes(1)
      expect(fs_accessSyncSpy).toHaveBeenNthCalledWith(
        1,
        '/path/to/summary.md',
        fs.constants.R_OK | fs.constants.W_OK
      )

      await expect(summary.filePath()).resolves.toBe('/path/to/summary.md')
    })

    it('Throws an error if the environment variable is not set', async () => {
      CoreMeta.stepSummaryPath = ''

      await expect(summary.filePath()).rejects.toThrow(
        'Unable to find environment variable for $GITHUB_STEP_SUMMARY. Check if your runtime environment supports job summaries.'
      )
    })

    it('Throws an error if the file does not exist', async () => {
      fs_accessSyncSpy.mockReset().mockImplementation(() => {
        throw new Error('File does not exist')
      })

      await expect(summary.filePath()).rejects.toThrow(
        `Unable to access summary file: '/path/to/summary.md'. Check if the file has correct read/write permissions.`
      )
    })
  })

  describe('wrap()', () => {
    it('Wraps the input string with the provided tag', () => {
      expect(summary.wrap('div', 'text')).toBe('<div>text</div>')
    })

    it('Creates a self-closing tag when no input string is provided', () => {
      expect(summary.wrap('img', null)).toBe('<img>')
    })

    it('Adds HTML attributes', () => {
      expect(
        summary.wrap('a', 'GitHub.com', {
          href: 'https://github.com',
          target: '_blank'
        })
      ).toBe('<a href="https://github.com" target="_blank">GitHub.com</a>')
    })
  })

  describe('write()', () => {
    let fs_accessSyncSpy: jest.SpiedFunction<typeof fs.accessSync>
    let fs_appendFileSyncSpy: jest.SpiedFunction<typeof fs.appendFileSync>
    let fs_existsSyncSpy: jest.SpiedFunction<typeof fs.existsSync>
    let fs_writeFileSyncSpy: jest.SpiedFunction<typeof fs.writeFileSync>
    let path_resolveSpy: jest.SpiedFunction<typeof path.resolve>

    beforeEach(() => {
      fs_accessSyncSpy = jest
        .spyOn(fs, 'accessSync')
        .mockImplementation(() => {})
      fs_appendFileSyncSpy = jest
        .spyOn(fs, 'appendFileSync')
        .mockImplementation(() => {})
      fs_existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true)
      fs_writeFileSyncSpy = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementation(() => {})
      path_resolveSpy = jest
        .spyOn(path, 'resolve')
        .mockReturnValueOnce('/path/to/summary.md')

      // Add some text to test with
      summary.addRaw('text')
    })

    afterEach(() => {
      fs_accessSyncSpy.mockRestore()
      fs_appendFileSyncSpy.mockRestore()
      fs_existsSyncSpy.mockRestore()
      fs_writeFileSyncSpy.mockRestore()
      path_resolveSpy.mockRestore()

      // Clear the buffer for the next test
      summary.emptyBuffer()
    })

    it('Appends content to the summary file', async () => {
      await summary.write()

      expect(fs_existsSyncSpy).toHaveBeenCalledWith('/path/to/summary.md')
      expect(fs_writeFileSyncSpy).not.toHaveBeenCalled()
      expect(fs_appendFileSyncSpy).toHaveBeenCalledWith(
        '/path/to/summary.md',
        'text',
        { encoding: 'utf8' }
      )
    })

    it('Creates the summary file if it does not exist', async () => {
      fs_existsSyncSpy.mockReset().mockReturnValueOnce(false)

      await summary.write()

      expect(fs_existsSyncSpy).toHaveBeenCalledWith('/path/to/summary.md')
      expect(fs_writeFileSyncSpy).toHaveBeenCalledWith(
        '/path/to/summary.md',
        '',
        { encoding: 'utf8' }
      )
      expect(fs_appendFileSyncSpy).toHaveBeenCalledWith(
        '/path/to/summary.md',
        'text',
        { encoding: 'utf8' }
      )
    })

    it('Overwrites the summary file', async () => {
      await summary.write({ overwrite: true })

      expect(fs_existsSyncSpy).toHaveBeenCalledWith('/path/to/summary.md')
      expect(fs_writeFileSyncSpy).toHaveBeenCalledWith(
        '/path/to/summary.md',
        'text',
        { encoding: 'utf8' }
      )
      expect(fs_appendFileSyncSpy).not.toHaveBeenCalled()
    })
  })

  describe('clear()', () => {
    it('Clears the buffer', async () => {
      const summary_emptyBufferSpy = jest
        .spyOn(summary, 'emptyBuffer')
        .mockReturnValue(summary)
      const summary_writeSpy = jest
        .spyOn(summary, 'write')
        .mockResolvedValue(summary)

      await summary.clear()

      expect(summary_emptyBufferSpy).toHaveBeenCalled()
      expect(summary_writeSpy).toHaveBeenCalled()
    })
  })

  describe('stringify()', () => {
    it('Returns the buffer', () => {
      summary.addRaw('text')

      expect(summary.stringify()).toEqual('text')
    })
  })

  describe('isEmptyBuffer()', () => {
    it('Returns true if the buffer is empty', () => {
      expect(summary.isEmptyBuffer()).toBe(true)
    })

    it('Returns false if the buffer is not empty', () => {
      summary.addRaw('text')

      expect(summary.isEmptyBuffer()).toBe(false)
    })
  })

  describe('emptyBuffer()', () => {
    it('Empties the buffer', () => {
      summary.addRaw('text')
      summary.emptyBuffer()

      expect(summary.isEmptyBuffer()).toBe(true)
      expect(summary.stringify()).toEqual('')
    })
  })

  describe('addRaw()', () => {
    it('Adds text', () => {
      summary.addRaw('text')

      expect(summary.stringify()).toEqual('text')
    })

    it('Adds an EOL', () => {
      const summary_addEOLSpy = jest
        .spyOn(summary, 'addEOL')
        .mockReturnValue(summary)

      summary.addRaw('text', true)

      expect(summary.stringify()).toEqual('text')
      expect(summary_addEOLSpy).toHaveBeenCalled()
    })
  })

  describe('addEOL()', () => {
    it('Adds an EOL', () => {
      const summary_addRawSpy = jest
        .spyOn(summary, 'addRaw')
        .mockReturnValue(summary)

      summary.addEOL()

      expect(summary_addRawSpy).toHaveBeenCalledWith(EOL)
    })
  })

  describe('addCodeBlock()', () => {
    it('Adds a code block', () => {
      summary.addCodeBlock('text')

      expect(summary.stringify() === `<pre><code>text</code></pre>${EOL}`).toBe(
        true
      )
    })

    it('Adds a code block with syntax highlighting', () => {
      summary.addCodeBlock('text', 'javascript')

      expect(
        summary.stringify() ===
          `<pre lang="javascript"><code>text</code></pre>${EOL}`
      ).toBe(true)
    })
  })

  describe('addList()', () => {
    it('Adds an unordered list', () => {
      summary.addList(['text', 'text'])

      expect(
        summary.stringify() === `<ul><li>text</li><li>text</li></ul>${EOL}`
      ).toBe(true)
    })

    it('Adds an ordered list', () => {
      summary.addList(['text', 'text'], true)

      expect(
        summary.stringify() === `<ol><li>text</li><li>text</li></ol>${EOL}`
      ).toBe(true)
    })
  })

  describe('addTable()', () => {
    it('Adds a table', () => {
      summary.addTable([
        [
          {
            data: 'text',
            header: true,
            colspan: '1',
            rowspan: '1'
          },
          {
            data: 'text',
            header: true,
            colspan: '1',
            rowspan: '1'
          },
          {
            data: 'text',
            header: true
          }
        ],
        [
          {
            data: 'text'
          },
          'text',
          'text'
        ]
      ])

      expect(
        summary.stringify() ===
          `<table><tr><th colspan="1" rowspan="1">text</th><th colspan="1" rowspan="1">text</th><th>text</th></tr><tr><td>text</td><td>text</td><td>text</td></tr></table>${EOL}`
      ).toBe(true)
    })
  })

  describe('addDetails()', () => {
    it('Adds a details element', () => {
      summary.addDetails('label', 'text')

      expect(
        summary.stringify() ===
          `<details><summary>label</summary>text</details>${EOL}`
      ).toBe(true)
    })
  })

  describe('addImage()', () => {
    it('Adds an image', () => {
      summary.addImage('src', 'alt')

      expect(summary.stringify() === `<img src="src" alt="alt">${EOL}`).toBe(
        true
      )
    })

    it('Adds an image with options', () => {
      summary.addImage('src', 'alt', {
        width: '100',
        height: '100'
      })

      expect(
        summary.stringify() ===
          `<img src="src" alt="alt" width="100" height="100">${EOL}`
      ).toBe(true)
    })
  })

  describe('addHeading()', () => {
    it('Adds a heading (no level)', () => {
      summary.addHeading('text')

      expect(summary.stringify() === `<h1>text</h1>${EOL}`).toBe(true)
    })

    it('Adds a heading (number level)', () => {
      summary.addHeading('text', 2)

      expect(summary.stringify() === `<h2>text</h2>${EOL}`).toBe(true)
    })

    it('Adds a heading (string level)', () => {
      summary.addHeading('text', '3')

      expect(summary.stringify() === `<h3>text</h3>${EOL}`).toBe(true)
    })

    it('Adds a heading (out of bounds level)', () => {
      summary.addHeading('text', -10)

      expect(summary.stringify() === `<h1>text</h1>${EOL}`).toBe(true)
    })

    it('Adds a heading (NaN level)', () => {
      summary.addHeading('text', 'text')

      expect(summary.stringify() === `<h1>text</h1>${EOL}`).toBe(true)
    })
  })

  describe('addSeparator()', () => {
    it('Adds a horizontal rule', () => {
      summary.addSeparator()

      expect(summary.stringify() === `<hr>${EOL}`).toBe(true)
    })
  })

  describe('addBreak()', () => {
    it('Adds a line break', () => {
      summary.addBreak()

      expect(summary.stringify() === `<br>${EOL}`).toBe(true)
    })
  })

  describe('addQuote()', () => {
    it('Adds a quote', () => {
      summary.addQuote('text')

      expect(
        summary.stringify() === `<blockquote>text</blockquote>${EOL}`
      ).toBe(true)
    })

    it('Adds a quote with citation', () => {
      summary.addQuote('text', 'citation')

      expect(
        summary.stringify() ===
          `<blockquote cite="citation">text</blockquote>${EOL}`
      ).toBe(true)
    })
  })

  describe('addLink()', () => {
    it('Adds a link', () => {
      summary.addLink('text', 'url')

      expect(summary.stringify() === `<a href="url">text</a>${EOL}`).toBe(true)
    })
  })
})
