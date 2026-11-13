import { defineConfig } from 'vitest/config';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.test' });

export default defineConfig({
  test: {
    include: ['tests/db/**/*.test.ts'],
    passWithNoTests: true,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
