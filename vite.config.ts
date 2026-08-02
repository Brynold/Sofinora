import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const indexableRoutes = [
  '/', '/starter-pack', '/secure-your-future', '/about', '/methodology', '/privacy', '/terms', '/disclosure', '/contact',
  '/calculators/cagr', '/calculators/irr', '/calculators/rd', '/calculators/sip', '/calculators/nsc', '/calculators/fd',
  '/calculators/hra', '/calculators/mf', '/calculators/goal-sip', '/calculators/ssy', '/calculators/retirement',
  '/calculators/nps', '/calculators/emi', '/calculators/ppf', '/calculators/inflation', '/calculators/emergency-fund',
  '/calculators/net-worth',
  '/calculators/income-tax', '/calculators/step-up-sip', '/calculators/home-loan-prepayment', '/calculators/swp',
  '/calculators/youtube-earnings',
];

const launchSeoPlugin = (siteUrl: string): Plugin => ({
  name: 'finplanner-launch-seo',
  generateBundle() {
    const sitemapLine = siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : '\n';
    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: `User-agent: *\nAllow: /${sitemapLine}`,
    });

    if (!siteUrl) return;
    const lastModified = new Date().toISOString().slice(0, 10);
    const urls = indexableRoutes.map((route) => `  <url>\n    <loc>${siteUrl}${route}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </url>`).join('\n');
    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');

  return {
    plugins: [react(), launchSeoPlugin(siteUrl)],
    server: {
      proxy: {
        '/api/presence': 'http://127.0.0.1:8788',
      },
    },
    build: {
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
      css: true,
    },
  };
});
