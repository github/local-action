import fs from 'fs'
import { EOL } from 'os'
import path from 'path'
import { CoreMeta } from './core.js'

/**
 * @github/local-action Unmodified
 *
 * A row for a summary table.
 */
export type SummaryTableRow = (SummaryTableCell | string)[]

/**
 * @github/local-action Unmodified
 */
export interface SummaryTableCell {
  /**
   * Cell content
   */
  data: string
  /**
   * Render cell as header
   * (optional) default: false
   */
  header?: boolean
  /**
   * Number of columns the cell extends
   * (optional) default: '1'
   */
  colspan?: string
  /**
   * Number of rows the cell extends
   * (optional) default: '1'
   */
  rowspan?: string
}

/**
 * @github/local-action Unmodified
 */
export interface SummaryImageOptions {
  /**
   * The width of the image in pixels. Must be an integer without a unit.
   * (optional)
   */
  width?: string
  /**
   * The height of the image in pixels. Must be an integer without a unit.
   * (optional)
   */
  height?: string
}

/**
 * @github/local-action Unmodified
 */
export interface SummaryWriteOptions {
  /**
   * Replace all existing content in summary file with buffer contents
   * (optional) default: false
   */
  overwrite?: boolean
}

/**
 * A class for creating and writing job step summaries.
 */
export class Summary {
  /** Output buffer to write to the summary file. */
  private _buffer: string

  /** The path to the summary file. */
  private _filePath?: string

  /**
   * @github/local-action Unmodified
   *
   * Initialize with an empty buffer.
   */
  constructor() {
    this._buffer = ''
  }

  /**
   * @github/local-action Modified
   *
   * Finds the summary file path from the environment. Rejects if the
   * environment variable is not set/empty or the file does not exist.
   *
   * @returns Step summary file path.
   */
  async filePath(): Promise<string> {
    // Return the current value, if available.
    if (this._filePath) return this._filePath

    // Throw if the path is not set/empty.
    if (!CoreMeta.stepSummaryPath)
      throw new Error(
        'Unable to find environment variable for $GITHUB_STEP_SUMMARY. Check if your runtime environment supports job summaries.'
      )

    try {
      // Resolve the full path to the file.
      CoreMeta.stepSummaryPath = path.resolve(
        process.cwd(),
        CoreMeta.stepSummaryPath
      )

      // If the file does not exist, create it. GitHub Actions runners normally
      // create this file automatically. When testing with local-action, we do
      // not know if the file already exists.
      if (!fs.existsSync(CoreMeta.stepSummaryPath))
        fs.writeFileSync(CoreMeta.stepSummaryPath, '', { encoding: 'utf8' })

      // Test access to the file (read or write).
      fs.accessSync(
        CoreMeta.stepSummaryPath,
        fs.constants.R_OK | fs.constants.W_OK
      )
    } catch {
      throw new Error(
        `Unable to access summary file: '${CoreMeta.stepSummaryPath}'. Check if the file has correct read/write permissions.`
      )
    }

    this._filePath = CoreMeta.stepSummaryPath
    return Promise.resolve(this._filePath)
  }

  /**
   * @github/local-action Unmodified
   *
   * Wraps content in the provided HTML tag and adds any specified attributes.
   *
   * @param tag HTML tag to wrap. Example: 'html', 'body', 'div', etc.
   * @param content The content to wrap within the tag.
   * @param attrs A key-value list of HTML attributes to add.
   * @returns Content wrapped in an HTML element.
   */
  wrap(
    tag: string,
    content: string | null,
    attrs: { [attribute: string]: string } = {}
  ): string {
    const htmlAttrs: string = Object.entries(attrs)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join('')

    return !content
      ? `<${tag}${htmlAttrs}>`
      : `<${tag}${htmlAttrs}>${content}</${tag}>`
  }

  /**
   * @github/local-action Modified
   *
   * Writes the buffer to the summary file and empties the buffer. This can
   * append (default) or overwrite the file.
   *
   * @param options Options for the write operation.
   * @returns A promise that resolves to the Summary instance for chaining.
   */
  async write(
    options: SummaryWriteOptions = { overwrite: false }
  ): Promise<Summary> {
    // Set the function to call based on the overwrite setting.
    const writeFunc = options.overwrite ? fs.writeFileSync : fs.appendFileSync

    // If the file does not exist, create it. GitHub Actions runners normally
    // create this file automatically. When testing with local-action, we do not
    // know if the file already exists.
    const filePath: string = await this.filePath()

    // Call the write function.
    writeFunc(filePath, this._buffer, { encoding: 'utf8' })

    // Empty the buffer.
    return this.emptyBuffer()
  }

  /**
   * @github/local-action Unmodified
   *
   * Clears the buffer and summary file.
   *
   * @returns A promise that resolve to the Summary instance for chaining.
   */
  async clear(): Promise<Summary> {
    return this.emptyBuffer().write({ overwrite: true })
  }

  /**
   * @github/local-action Unmodified
   *
   * Returns the current buffer as a string.
   *
   * @returns Current buffer contents.
   */
  stringify(): string {
    return this._buffer
  }

  /**
   * @github/local-action Unmodified
   *
   * Returns `true` the buffer is empty, `false` otherwise.
   *
   * @returns Whether the buffer is empty.
   */
  isEmptyBuffer(): boolean {
    return this._buffer.length === 0
  }

  /**
   * @github/local-action Unmodified
   *
   * Resets the buffer without writing to the summary file.
   *
   * @returns The Summary instance for chaining.
   */
  emptyBuffer(): Summary {
    this._buffer = ''
    return this
  }

  /**
   * @github/local-action Unmodified
   *
   * Adds raw text to the buffer.
   *
   * @param text The content to add.
   * @param addEOL Whether to append `EOL` to the raw text (default: `false`).
   *
   * @returns The Summary instance for chaining.
   */
  addRaw(text: string, addEOL: boolean = false): Summary {
    this._buffer += text
    return addEOL ? this.addEOL() : this
  }

  /**
   * @github/local-action Unmodified
   *
   * Adds the operating system-specific `EOL` marker to the buffer.
   *
   * @returns The Summary instance for chaining.
   */
  addEOL(): Summary {
    return this.addRaw(EOL)
  }

  /**
   * @github/local-action Modified
   *
   * Adds a code block (\<code\>) to the buffer.
   *
   * @param code Content to render within the code block.
   * @param lang Language to use for syntax highlighting.
   * @returns Summary instance for chaining.
   */
  addCodeBlock(code: string, lang?: string): Summary {
    return this.addRaw(
      this.wrap('pre', this.wrap('code', code), lang ? { lang } : {})
    ).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a list (\<li\>) element to the buffer.
   *
   * @param items List of items to render.
   * @param ordered Whether the list should be ordered.
   * @returns Summary instance for chaining.
   */
  addList(items: string[], ordered: boolean = false): Summary {
    return this.addRaw(
      this.wrap(
        ordered ? 'ol' : 'ul',
        items.map(item => this.wrap('li', item)).join('')
      )
    ).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a table (\<table\>) element to the buffer.
   *
   * @param rows Table rows to render.
   * @returns Summary instance for chaining.
   */
  addTable(rows: SummaryTableRow[]): Summary {
    return this.addRaw(
      this.wrap(
        'table',
        // The table body consists of a list of rows, each with a list of cells.
        rows
          .map(row => {
            const cells: string = row
              .map(cell => {
                // Cell is a string, return as-is.
                if (typeof cell === 'string') return this.wrap('td', cell)

                // Cell is a SummaryTableCell, extract the data and attributes.
                return this.wrap(cell.header ? 'th' : 'td', cell.data, {
                  ...(cell.colspan ? { colspan: cell.colspan } : {}),
                  ...(cell.rowspan ? { rowspan: cell.rowspan } : {})
                })
              })
              .join('')

            return this.wrap('tr', cells)
          })
          .join('')
      )
    ).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a details (\<details\>) element to the buffer.
   *
   * @param label Text for the \<summary\> element.
   * @param content Text for the \<details\> container.
   * @returns Summary instance for chaining.
   */
  addDetails(label: string, content: string): Summary {
    return this.addRaw(
      this.wrap('details', this.wrap('summary', label) + content)
    ).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds an image (\<img\>) element to the buffer.
   *
   * @param src Path to the image to embed.
   * @param alt Text description of the image.
   * @param options Additional image attributes.
   * @returns Summary instance for chaining.
   */
  addImage(
    src: string,
    alt: string,
    options: SummaryImageOptions = {}
  ): Summary {
    return this.addRaw(
      this.wrap('img', null, {
        src,
        alt,
        ...(options.width ? { width: options.width } : {}),
        ...(options.height ? { height: options.height } : {})
      })
    ).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a heading (\<hX\>) element to the buffer.
   *
   * @param text Heading text to render.
   * @param level Heading level. Defaults to `1`.
   * @returns Summary instance for chaining.
   */
  addHeading(text: string, level: number | string = 1): Summary {
    // If level is a string, attempt to parse it as a number.
    const levelAsNum = typeof level === 'string' ? parseInt(level) : level

    // If level is less than 1 or greater than 6, default to `h1`.
    const tag =
      Number.isNaN(levelAsNum) || levelAsNum < 1 || levelAsNum > 6
        ? 'h1'
        : `h${level}`

    const element = this.wrap(tag, text)
    return this.addRaw(element).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a horizontal rule (\<hr\>) element to the buffer.
   *
   * @returns Summary instance for chaining.
   */
  addSeparator(): Summary {
    return this.addRaw(this.wrap('hr', null)).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a line break (\<br\>) to the buffer.
   *
   * @returns Summary instance for chaining.
   */
  addBreak(): Summary {
    return this.addRaw(this.wrap('br', null)).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds a block quote \<blockquote\> element to the buffer.
   *
   * @param text Quote text to render.
   * @param cite (Optional) Citation URL.
   * @returns Summary instance for chaining.
   */
  addQuote(text: string, cite?: string): Summary {
    return this.addRaw(
      this.wrap('blockquote', text, cite ? { cite } : {})
    ).addEOL()
  }

  /**
   * @github/local-action Modified
   *
   * Adds an anchor (\<a\>) element to the buffer.
   *
   * @param text Text content to render.
   * @param href Hyperlink to the target.
   * @returns Summary instance for chaining.
   */
  addLink(text: string, href: string): Summary {
    return this.addRaw(this.wrap('a', text, { href })).addEOL()
  }
}
