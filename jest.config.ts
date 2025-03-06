import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/bootstrap.ts',
    'src/types/quibble.d.ts',
    'src/commands/run.ts',
    'src/stubs/artifact/artifact.ts'
  ],
  coverageReporters: ['json-summary', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'ts'],
  preset: 'ts-jest',
  reporters: ['default', 'jest-junit'],
  resolver: 'ts-jest-resolver',
  roots: ['<rootDir>/src/', '<rootDir>/__fixtures__/', '<rootDir>/__tests__/'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/dist/', '/megalinter-reports/', '/node_modules/'],
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      { useESM: true, tsconfig: 'tsconfig.eslint.json' }
    ]
  },
  verbose: true
}

export default config
