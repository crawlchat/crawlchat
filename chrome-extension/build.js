import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

async function buildExtension() {
  console.log("Building React popup...");

  // Build the React popup
  await build({
    entryPoints: ["src/popup.tsx"],
    bundle: true,
    outfile: "build/dist/popup.js",
    format: "iife",
    globalName: "Popup",
    jsx: "automatic",
    target: "es2020",
    minify: true,
    sourcemap: true,
    external: ["chrome"],
  });

  // Build background script
  await build({
    entryPoints: ["src/background.ts"],
    bundle: true,
    outfile: "build/dist/background.js",
    format: "iife",
    target: "es2020",
    minify: true,
    sourcemap: true,
    external: ["chrome"],
  });

  // Build content script
  await build({
    entryPoints: ["src/content.ts"],
    bundle: true,
    outfile: "build/dist/content.js",
    format: "iife",
    jsx: "automatic",
    target: "es2020",
    minify: true,
    sourcemap: true,
    external: ["chrome"],
  });

  console.log("Building CSS...");

  // Build popup CSS
  execSync(
    "npx @tailwindcss/cli -i ./src/styles.css -o ./build/dist/styles.css --minify",
    { stdio: "inherit" }
  );

  // Build inject CSS with Tailwind and scoped classes
  execSync(
    "npx @tailwindcss/cli -i ./src/inject.css -o ./build/dist/inject.css --minify",
    { stdio: "inherit" }
  );

  console.log("Copying static files...");

  // Copy entire static directory to dist
  const { cpSync, copyFileSync, existsSync } = await import("fs");

  if (existsSync("static")) {
    cpSync("static", "build/dist", { recursive: true });
  }

  // Copy popup.html from src to dist
  copyFileSync("src/popup.html", "build/dist/popup.html");

  console.log("Build complete!");
}

buildExtension().catch(console.error);
