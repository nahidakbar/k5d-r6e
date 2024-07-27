module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ['lcov'],
    collectCoverageFrom: [
      'src/**/*.ts'
    ],
    roots: ['src'],
  }
  