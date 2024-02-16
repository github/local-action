const addPath = jest.fn()
const debug = jest.fn()
const endGroup = jest.fn()
const error = jest.fn()
const exportVariable = jest.fn()
const getBooleanInput = jest.fn()
const getIDToken = jest.fn()
const getInput = jest.fn()
const getMultilineInput = jest.fn()
const getState = jest.fn()
const group = jest.fn()
const info = jest.fn()
const isDebug = jest.fn()
const notice = jest.fn()
const saveState = jest.fn()
const setCommandEcho = jest.fn()
const setFailed = jest.fn()
const setOutput = jest.fn()
const setSecret = jest.fn()
const startGroup = jest.fn()
const warning = jest.fn()

const summary = {}
summary['filePath'] = jest.fn().mockReturnValue(summary)
summary['wrap'] = jest.fn().mockReturnValue(summary)
summary['write'] = jest.fn().mockReturnValue(summary)
summary['clear'] = jest.fn().mockReturnValue(summary)
summary['stringify'] = jest.fn().mockReturnValue(summary)
summary['isEmptyBuffer'] = jest.fn().mockReturnValue(summary)
summary['emptyBuffer'] = jest.fn().mockReturnValue(summary)
summary['addRaw'] = jest.fn().mockReturnValue(summary)
summary['addEOL'] = jest.fn().mockReturnValue(summary)
summary['addCodeBlock'] = jest.fn().mockReturnValue(summary)
summary['addList'] = jest.fn().mockReturnValue(summary)
summary['addTable'] = jest.fn().mockReturnValue(summary)
summary['addDetails'] = jest.fn().mockReturnValue(summary)
summary['addImage'] = jest.fn().mockReturnValue(summary)
summary['addHeading'] = jest.fn().mockReturnValue(summary)
summary['addSeparator'] = jest.fn().mockReturnValue(summary)
summary['addBreak'] = jest.fn().mockReturnValue(summary)
summary['addQuote'] = jest.fn().mockReturnValue(summary)
summary['addLink'] = jest.fn().mockReturnValue(summary)

export {
  addPath,
  debug,
  endGroup,
  error,
  exportVariable,
  getBooleanInput,
  getIDToken,
  getInput,
  getMultilineInput,
  getState,
  group,
  info,
  isDebug,
  notice,
  saveState,
  setCommandEcho,
  setFailed,
  setOutput,
  setSecret,
  startGroup,
  summary,
  warning
}
