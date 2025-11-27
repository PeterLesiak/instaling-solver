import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './src/index.ts',
  outDir: 'bin',
  noExternal: () => true,
  minify: true,
});
