import type { ComponentType } from 'react';

type MdxModule = { default: ComponentType<{ components?: Record<string, unknown> }> };

/**
 * Optional MDX for a case-study panel lives at
 * src/content/work/<slug>/<stage>.mdx and renders under the panel's body text.
 */
const modules = import.meta.glob<MdxModule>('./work/*/*.mdx', { eager: true });

export function panelMdx(slug: string, stage: string) {
  return modules[`./work/${slug}/${stage}.mdx`]?.default;
}
