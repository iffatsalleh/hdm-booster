import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/gas/**/*.test.ts', 'tests/security/**/*.test.ts'],
    passWithNoTests: true,
  },
});
