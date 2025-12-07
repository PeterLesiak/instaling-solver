import { defineConfig } from 'tsdown';

export default defineConfig({
  name: 'instaling-solver',
  entry: './src/index.ts',
  outDir: 'build',
  minify: {
    compress: true,
    mangle: { toplevel: true },
  },
});
