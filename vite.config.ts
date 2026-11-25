import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig(async ({ command }) => {
  let pkgVersion = '1.0.34';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
    if (pkg.version) pkgVersion = pkg.version;
  } catch {}

  const appVersion = process.env.VITE_APP_VERSION || pkgVersion;
  const buildNumber = parseInt(process.env.VITE_BUILD_NUMBER || appVersion.split('.').pop() || '34', 10);

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
  ];

  if (command === 'build') {
    const { VitePWA } = await import('vite-plugin-pwa');
    plugins.push(
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: './',
          name: 'МастерВарка — Калькулятор Пивовара',
          short_name: 'МастерВарка',
          description: 'Профессиональный калькулятор пивоварения, подбор рецептов по ингредиентам, ИИ-дизайн этикеток и календарь брожения.',
          theme_color: '#d97706',
          background_color: '#1c1917',
          display: 'standalone',
          orientation: 'portrait',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: {
          enabled: false,
        },
      })
    );
  }

  return {
    base: './',
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      __BUILD_NUMBER__: JSON.stringify(buildNumber),
    },
    plugins,
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      sourcemap: false,
      minify: 'esbuild' as const,
      cssMinify: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
    },
    esbuild: command === 'build' ? {
      drop: ['debugger' as const],
      legalComments: 'none' as const,
    } : undefined,
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
