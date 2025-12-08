import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddleware: false,
    functionPerRoute: false  // Ajoutez ceci
  }),
  integrations: [tailwind()],
  site: 'https://emcafe.netlify.app', // Ajoutez votre URL
});
