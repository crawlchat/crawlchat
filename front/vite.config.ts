import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import commonjs from "vite-plugin-commonjs";

export default defineConfig({
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), commonjs()],
  build: {
    watch: null,
  },
  server: {
    allowedHosts: [
      "efce-2405-201-d005-c0da-dd7a-d343-3082-8c30.ngrok-free.app",
    ],
  },
  envDir: "../",
});
