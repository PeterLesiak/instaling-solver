import { defineConfig } from 'tsdown';

export default defineConfig({
  name: 'instaling-solver',
  entry: './src/index.ts',
  outDir: 'build',
  noExternal: () => true,
  minify: { compress: true, mangle: { toplevel: true } },
});
