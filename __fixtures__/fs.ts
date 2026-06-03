import { jest } from '@jest/globals'
import { constants as fsConstants, promises as fsPromises } from 'node:fs'

export const accessSync = jest.fn()
export const constants = fsConstants
export const promises = fsPromises
export const copyFileSync = jest.fn()
export const createWriteStream = jest.fn()
export const createReadStream = jest.fn()
export const existsSync = jest.fn()
export const mkdirSync = jest.fn()
export const readdirSync = jest.fn()
export const readFileSync = jest.fn()
export const rmSync = jest.fn()
export const statSync = jest.fn()
export const writeFileSync = jest.fn()

export default {
  accessSync,
  constants,
  promises,
  copyFileSync,
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
}
