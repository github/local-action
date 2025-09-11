import { jest } from '@jest/globals'

export const accessSync = jest.fn()
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
