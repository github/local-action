/**
 * Caching validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Cache reservation error
 */
export class ReserveCacheError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReserveCacheError'
    Object.setPrototypeOf(this, ReserveCacheError.prototype)
  }
}

/**
 * Invalid response error
 */
export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidResponseError'
  }
}
