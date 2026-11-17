export default {
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.{test,spec}.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { presets: ['next/babel'] }],
  },
};
