import nextConfig from 'eslint-config-next';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'e2e/**'],
  },
  ...nextConfig,
  {
    rules: {
      // React 19 stylistic rule: noisy across many legacy data-fetching
      // effects. Demoted to warning until patterns are migrated to
      // useEffectEvent / derived state.
      'react-hooks/set-state-in-effect': 'warn',
      // Intentional empty/loose dep arrays in data-loading effects; the
      // current pattern is well-understood. Promote to error in a follow-up.
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default config;
