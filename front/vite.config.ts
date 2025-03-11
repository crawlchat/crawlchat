import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import commonjs from "vite-plugin-commonjs";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths(), commonjs()],
  build: {
    watch: null,
  },
  server: {
    allowedHosts: ["3ebd-2405-201-d005-c0da-48e2-c3b9-81ad-a596.ngrok-free.app"],
  }
});
