import nextConfig from 'eslint-config-next';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...nextConfig,
];
