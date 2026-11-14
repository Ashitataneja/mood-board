import type { ComponentType } from 'react';

interface PostModule {
  default: ComponentType;
  frontmatter: { title: string; date: string; standfirst: string };
}

const modules = import.meta.glob<PostModule>('./writing/*.mdx', { eager: true });

export const posts = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: path.replace('./writing/', '').replace('.mdx', ''),
    ...mod.frontmatter,
    Body: mod.default,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));
