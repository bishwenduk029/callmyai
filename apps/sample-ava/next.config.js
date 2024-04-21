/** @type {import('next').NextConfig} */
const CopyPlugin = require('copy-webpack-plugin')

const wasmPaths = [
  './node_modules/onnxruntime-web/dist/ort-wasm.wasm',
  './node_modules/onnxruntime-web/dist/ort-wasm-threaded.wasm',
  './node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm',
  './node_modules/onnxruntime-web/dist/ort-wasm-simd.jsep.wasm',
  './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
  './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
  './node_modules/onnxruntime-web/dist/ort-training-wasm-simd.wasm'
]

module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com'
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false
    }

    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            ...wasmPaths.map(p => ({ from: p, to: 'static/chunks/app' })),
            { from: 'public/processor.js', to: 'static/chunks/app' }
          ]
        })
      )

      config.plugins.push(
        new CopyPlugin({
          patterns: [
            ...wasmPaths.map(p => ({ from: p, to: 'static/chunks' })),
            { from: 'public/processor.js', to: 'static/chunks' }
          ]
        })
      )
    }

    return config
  }
}
