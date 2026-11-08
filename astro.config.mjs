import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  devToolbar: { enabled: false },
  vite: { server: { strictPort: true }, preview: { strictPort: true } },
  site: 'https://canberkefe.dev',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
