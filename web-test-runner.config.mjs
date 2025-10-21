import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  testFramework: {
    config: {
      timeout: 5000,
    },
  },
  coverage: true,
  coverageConfig: {
    include: ['src/**/*.js'],
    exclude: ['test/**/*.js', 'dist/**/*.js'],
    threshold: {
      statements: 45,
      branches: 50,
      functions: 20,
      lines: 45,
    },
  },
};
