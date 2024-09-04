/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: 'node',
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
    verbose: true,
    collectCoverage: true, // Enables test coverage collection
    collectCoverageFrom: [
        'src/**/*.ts',
        '!**/node_modules/**',
        '!tests/**/*.{test,spec}.ts',
    ],
    coverageDirectory: 'coverage', // Output directory for coverage reports
    coverageReporters: ['html'], // Report formats
};
