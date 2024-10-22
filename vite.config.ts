/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const { extname, relative, resolve } = path;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: 'tsconfig.json',
      exclude: ['test', '**/*.test.ts', '**/*.test.tsx'],
      outDir: 'dist/types',
      entryRoot: 'lib',
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'LICENSE',
          dest: '',
        },
      ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'lib/index.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'wagmi', 'viem'],
      input: Object.fromEntries(
        glob
          .sync(['lib/index.ts', 'lib/components/**/*.{ts,tsx}'], {
            ignore: ['**/*.test.ts', '**/*.test.tsx'],
          })
          .map((file) => [
            // The name of the entry point
            // lib/nested/foo.ts becomes nested/foo
            relative('lib', file.slice(0, file.length - extname(file).length)),
            // The absolute path to the entry file
            // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[format]/[name].js',
      },
    },
    copyPublicDir: true,
  },
  test: {
    pool: 'forks',
    coverage: {
      provider: 'v8',
      all: true,
      include: ['lib/**/*.{ts,tsx}'],
      exclude: ['lib/index.ts', 'lib/components/icons/**/*', 'lib/assets/**/*'],
      reporter: ['text', 'json', 'html'],
    },
    environment: 'happy-dom',
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    setupFiles: ['test/index.tsx'],
  },
});
