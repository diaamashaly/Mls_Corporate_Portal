import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: { propsDestructure: true },
    }),
    svgLoader(),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },

  server: {
    port: 9000,
    host: "0.0.0.0",
    hmr: {
      clientPort: 9000,
    },
  },

  define: { "process.env": {} },
});
