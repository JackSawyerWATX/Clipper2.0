module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'config/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 10000
}
