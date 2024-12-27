const { createDefaultPreset } = require('ts-jest');

/** @type {import('jest').Config} */
module.exports = {
  ...createDefaultPreset(),
  roots: ['<rootDir>/src'],
  testRegex: './*.spec.ts$',
  silent: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.(t|j)s', '**/*.mjs', '!**/index.ts'],
  coverageReporters: ['lcov'],
  coverageThreshold: { global: { statements: 10 } },
  ...(process.env.CI && {
    ci: true,
    coverageReporters: ['lcovonly', 'github-actions'],
  }),
};
