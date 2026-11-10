import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    define:
      mode === "development"
        ? { "process.env.NODE_ENV": JSON.stringify("production") }
        : undefined,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            klinecharts: ["klinecharts"],
          },
        },
      },
    },
  }
})
