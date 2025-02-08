import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";



export default defineConfig({
  server: {
    port: 3000,
    hmr: {
      timeout: 1000
    }
  },
  plugins: [
    reactRouter(),
    tsconfigPaths()
  ],
  css: {
    modules: {
      localsConvention: "camelCase"
    }
  }
});
