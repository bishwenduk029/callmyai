import { defineConfig } from "tsup";

export default defineConfig([
  // React APIs
  {
    entry: ['ui/index.ts'],
    outDir: 'ui/dist',
    banner: {
      js: "'use client'",
    },
    format: ['cjs', 'esm'],
    external: ['react'],
    dts: true,
    sourcemap: true,
  },
]);
