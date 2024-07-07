import CopyPlugin from "copy-webpack-plugin"
import { withContentlayer } from "next-contentlayer"

import("./src/env.mjs")

const wasmPaths = [
  "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-threaded.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd.jsep.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm",
  "./node_modules/onnxruntime-web/dist/ort-training-wasm-simd.wasm",
]

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }

    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            ...wasmPaths.map((p) => ({ from: p, to: "static/chunks/app" })),
            { from: "public/processor.js", to: "static/chunks/app" },
          ],
        })
      )

      config.plugins.push(
        new CopyPlugin({
          patterns: [
            ...wasmPaths.map((p) => ({ from: p, to: "static/chunks" })),
            { from: "public/processor.js", to: "static/chunks" },
          ],
        })
      )
    }

    return config
  },
}

export default withContentlayer(nextConfig)
