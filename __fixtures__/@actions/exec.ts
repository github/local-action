import { jest } from '@jest/globals'

export const exec = jest.fn().mockImplementation(() => {})
export const getExecOutput = jest.fn().mockImplementation(() => {})

export default {
  exec,
  getExecOutput
}
