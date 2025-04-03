import { jest } from '@jest/globals'

export const debug = jest.fn().mockImplementation(() => {})
export const error = jest.fn().mockImplementation(() => {})
export const info = jest.fn().mockImplementation(() => {})
export const getInput = jest.fn().mockImplementation(() => {})
export const setOutput = jest.fn().mockImplementation(() => {})
export const setFailed = jest.fn().mockImplementation(() => {})
export const warning = jest.fn().mockImplementation(() => {})
export const summary = {
  addRaw: jest.fn().mockImplementation(() => {}),
  write: jest.fn().mockImplementation(() => {})
}
