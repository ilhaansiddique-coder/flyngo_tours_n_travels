export default {
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { presets: ['next/babel'] }],
  },
};
