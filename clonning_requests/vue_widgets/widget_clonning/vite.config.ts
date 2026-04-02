import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // server: {
  //   proxy: {
  //     "/fluighub": {
  //       target:
  //         "https://strategiconsultoria176588.fluig.cloudtotvs.com.br:2450",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
  build: {
    outDir:
      "../../wcm/widget/Clonning_widget/src/main/webapp/resources/js/app-vue",
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
