import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Under Vitest, `@lit/react` resolves to its SSR build, which never attaches Ionic's event
// handlers (onIonInput, onIonChange, ...). Point tests at the browser build instead.
const litReactBrowserBuild = fileURLToPath(
  new URL('./node_modules/@lit/react/index.js', import.meta.url),
);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    alias: { '@lit/react': litReactBrowserBuild },
    server: { deps: { inline: [/@stencil\/react-output-target/] } },
  },
});
