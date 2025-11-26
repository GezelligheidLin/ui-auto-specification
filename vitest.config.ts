import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const r = (p: string) => path.resolve(fileURLToPath(new URL('.', import.meta.url)), p);

export default defineConfig({
  resolve: {
    alias: {
      '@': r('./src')
    }
  },
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      provider: 'v8'
    }
  }
});
