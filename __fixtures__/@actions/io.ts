import { jest } from '@jest/globals'

export const which = jest.fn().mockImplementation(() => {})
export const mkdirP = jest.fn().mockImplementation(() => {})

export default {
  which,
  mkdirP
}
