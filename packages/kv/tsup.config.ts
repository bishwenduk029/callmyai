import { defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts"],
  format: ["esm"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use server"',
    };
  },
  dts: true,
  minify: true,
  external: ["react"],
  ...options,
}));
