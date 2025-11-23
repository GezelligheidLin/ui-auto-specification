import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  entry: ['src/index.ts', 'src/runtime.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: !watch,
  minify: false,
  target: 'node18',
  tsconfig: 'tsconfig.build.json',
  shims: false
}));
