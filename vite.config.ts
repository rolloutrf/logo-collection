import path from "path"
import fs from "fs"
import type { ServerOptions } from "https"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const useHttps = process.env.DEV_HTTPS === "true"
const sslKey = process.env.SSL_KEY_FILE
const sslCrt = process.env.SSL_CRT_FILE
const httpsOption: ServerOptions | undefined =
  useHttps && sslKey && sslCrt && fs.existsSync(sslKey) && fs.existsSync(sslCrt)
    ? {
        key: fs.readFileSync(sslKey),
        cert: fs.readFileSync(sslCrt),
      }
    : undefined

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true,
    https: httpsOption,
    proxy: {
      "/github": {
        target: "https://api.github.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/github/, ""),
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    open: true,
    https: httpsOption,
    proxy: {
      "/github": {
        target: "https://api.github.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/github/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
