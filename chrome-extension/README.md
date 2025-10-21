# CrawlChat Chrome Extension

A modern Chrome extension built with React, TypeScript, Tailwind CSS v4, and DaisyUI for CrawlChat.

## Features

- Background script for extension lifecycle management
- Content script that runs on all pages
- Modern React-based popup interface with Tailwind CSS v4 and DaisyUI components
- TypeScript support with proper type definitions
- Component-based architecture for better maintainability
- Custom CrawlChat brand theme with light/dark variants
- Theme support with persistent storage
- Responsive design optimized for Chrome extension popup

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Watch for changes during development:
   ```bash
   npm run watch
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build/dist` folder

5. Package for Chrome Web Store:
   ```bash
   npm run package
   ```
   This creates a `crawlchat-extension.zip` file ready for upload.

## Project Structure

- `src/` - TypeScript source files
- `static/` - Static assets (manifest.json, popup.html, images)
- `build/dist/` - Compiled output (created after build)
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Files

- `src/background.ts` - Background service worker
- `src/content.ts` - Content script that runs on web pages
- `src/popup.tsx` - React-based popup component
- `src/popup.html` - Popup HTML template
- `static/manifest.json` - Chrome extension manifest
- `static/logo.png` - Extension icon
- `build.js` - Custom build script using esbuild
