import { jest } from '@jest/globals'

export const accessSync = jest.fn()
export const createWriteStream = jest.fn()
export const createReadStream = jest.fn()
export const mkdirSync = jest.fn()
export const rmSync = jest.fn()

export default {
  accessSync,
  createWriteStream,
  createReadStream,
  mkdirSync,
  rmSync
}
