module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  },
  moduleFileExtensions: ['js','json','ts'],
  rootDir: 'src',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
};
