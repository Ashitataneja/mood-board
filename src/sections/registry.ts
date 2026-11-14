import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { SectionId } from '../content/types';

type BodyModule = Promise<{ default: ComponentType<{ slug?: string }> }>;

/** Loaders, shared by React.lazy and the dive's preload. */
export const loadBody: Record<SectionId, () => BodyModule> = {
  work: () => import('./Work'),
  about: () => import('./About'),
  writing: () => import('./Writing'),
  gallery: () => import('./Gallery'),
  contact: () => import('./Contact'),
  resume: () => import('./Resume'),
};

/** Each section's interior is its own chunk (brief §13). */
export const sectionBodies = Object.fromEntries(
  Object.entries(loadBody).map(([id, load]) => [id, lazy(load)]),
) as Record<SectionId, LazyExoticComponent<ComponentType<{ slug?: string }>>>;
