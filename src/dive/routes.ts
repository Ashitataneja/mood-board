import type { SectionId } from '../content/types';

const ids: SectionId[] = ['work', 'about', 'writing', 'gallery', 'contact', 'resume'];

/** The section a pathname belongs to, or null for the landing and anything else. */
export function sectionFromPath(pathname: string): SectionId | null {
  const first = pathname.split('/')[1] as SectionId;
  return ids.includes(first) ? first : null;
}

export function isSectionId(v: string | undefined): v is SectionId {
  return !!v && (ids as string[]).includes(v);
}
