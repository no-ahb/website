import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Strip HTML comments from built pages so source-only notes — editorial
 * TODOs, withheld credits, structural markers — never ship. Static output
 * carries no functional comments, so a blanket strip is safe.
 */
function stripHtmlComments() {
  return {
    name: 'strip-html-comments',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
        let stripped = 0;
        for (const page of pages) {
          const full = join(root, page);
          const html = await readFile(full, 'utf8');
          // Strip comments but skip <script>/<style> so comment-like text inside them is preserved.
          const out = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, (m) => (m.startsWith('<!--') ? '' : m));
          if (out !== html) { await writeFile(full, out); stripped++; }
        }
        logger.info(`stripped HTML comments from ${stripped} page(s)`);
      },
    },
  };
}

export default defineConfig({
  site: 'https://noahberrie.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap(),
    stripHtmlComments(),
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
