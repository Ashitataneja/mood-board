import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, transformWithEsbuild, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

/**
 * Every gallery image needs real alt text (brief §8.4): fail the build
 * (and the dev server) if any entry's alt is missing or blank.
 */
function galleryAltCheck(): Plugin {
  const file = resolve(dirname(fileURLToPath(import.meta.url)), 'src/content/gallery.ts');
  return {
    name: 'gallery-alt-check',
    async buildStart() {
      this.addWatchFile(file);
      const { code } = await transformWithEsbuild(readFileSync(file, 'utf8'), file, {
        loader: 'ts',
        format: 'esm',
      });
      const mod = await import(
        `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
      );
      const missing = (mod.gallery as { alt?: string }[])
        .map((g, i) => (g.alt && g.alt.trim() ? null : `#${i + 1}`))
        .filter(Boolean);
      if (missing.length) {
        this.error(
          `Gallery images missing alt text in src/content/gallery.ts: ${missing.join(', ')}`,
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    galleryAltCheck(),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        providerImportSource: undefined,
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
});
