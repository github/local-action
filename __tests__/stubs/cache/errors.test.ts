import {
  InvalidResponseError,
  ReserveCacheError,
  ValidationError
} from '../../../src/stubs/cache/errors.js'

describe('cache/errors', () => {
  describe('ValidationError', () => {
    it('Creates a ValidationError with the correct message', () => {
      const message = 'Test validation error'
      const error = new ValidationError(message)

      expect(error.message).toBe(message)
      expect(error.name).toBe('ValidationError')
      expect(error).toBeInstanceOf(ValidationError)
      expect(error).toBeInstanceOf(Error)
    })

    it('Sets the prototype correctly', () => {
      const error = new ValidationError('test')

      expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype)
    })
  })

  describe('ReserveCacheError', () => {
    it('Creates a ReserveCacheError with the correct message', () => {
      const message = 'Test reserve cache error'
      const error = new ReserveCacheError(message)

      expect(error.message).toBe(message)
      expect(error.name).toBe('ReserveCacheError')
      expect(error).toBeInstanceOf(ReserveCacheError)
      expect(error).toBeInstanceOf(Error)
    })

    it('Sets the prototype correctly', () => {
      const error = new ReserveCacheError('test')

      expect(Object.getPrototypeOf(error)).toBe(ReserveCacheError.prototype)
    })
  })

  describe('InvalidResponseError', () => {
    it('Creates an InvalidResponseError with the correct message', () => {
      const message = 'Test invalid response error'
      const error = new InvalidResponseError(message)

      expect(error.message).toBe(message)
      expect(error.name).toBe('InvalidResponseError')
      expect(error).toBeInstanceOf(InvalidResponseError)
      expect(error).toBeInstanceOf(Error)
    })
  })
})
