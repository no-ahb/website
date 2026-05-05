import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://noahberrie.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/scoring'),
    }),
  ],
  build: {
    assets: '_assets',
  },
  vite: {
    css: {
      preprocessorOptions: {},
    },
  },
});
