import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/worker/**/*.test.ts'],
    passWithNoTests: true,
    // DB-backed tests share the single prod database: run files one at a time, allow slow cold connects.
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
