import type { Section, SectionId } from './types';

export const sections: Section[] = [
  {
    id: 'writing',
    name: 'Writing',
    path: '/writing',
    shape: 'arch',
    color: 'var(--writing)',
    // "its dreams": the green mixed with 40% night
    bg: 'color-mix(in srgb, var(--writing) 60%, var(--night))',
    text: 'paper',
    defaultMood: 'sleepy',
    hoverLine: 'I overthink things. Professionally.',
    crowd: { x: 400, y: 330, w: 280, h: 560 },
    z: 0,
    hero: { title: 'WRITING', line: '[PLACEHOLDER: one line about what you write]' },
  },
  {
    id: 'gallery',
    name: 'Gallery',
    path: '/gallery',
    shape: 'starburst',
    color: 'var(--gallery)',
    text: 'ink',
    defaultMood: 'open',
    hoverLine: 'Ooh, pictures! Sketches, photos and experiments.',
    crowd: { x: 900, y: 300, w: 340, h: 340 },
    z: 1,
    hero: { title: 'GALLERY', line: 'Sketches, photos and experiments. Drag them around.' },
  },
  {
    id: 'about',
    name: 'About',
    path: '/about',
    shape: 'flower',
    color: 'var(--about)',
    text: 'ink',
    defaultMood: 'wink',
    hoverLine: "Hi. I'm a bit shy. Commerce, psychology, then design.",
    crowd: { x: 140, y: 520, w: 340, h: 340 },
    z: 2,
    hero: { title: 'ABOUT', line: 'It opens up slowly.' },
  },
  {
    id: 'work',
    name: 'Work',
    path: '/work',
    shape: 'squircle',
    color: 'var(--work)',
    text: 'paper',
    defaultMood: 'intense',
    hoverLine: "I'm the serious one. Six case studies in here.",
    crowd: { x: 560, y: 450, w: 420, h: 500 },
    z: 3,
    hero: { title: 'WORK', line: 'Six case studies. Scroll sideways.' },
  },
  {
    id: 'contact',
    name: 'Contact',
    path: '/contact',
    shape: 'cloud',
    color: 'var(--contact)',
    text: 'ink',
    defaultMood: 'grin',
    hoverLine: "Say hi! I'd love to hear from you.",
    crowd: { x: 1020, y: 560, w: 320, h: 320 },
    z: 4,
    hero: { title: 'CONTACT', line: 'Say hi.' },
  },
  {
    id: 'resume',
    name: 'Résumé',
    path: '/resume',
    shape: 'square',
    color: 'var(--resume)',
    text: 'ink',
    defaultMood: 'deadpan',
    hoverLine: 'Just the facts. One page.',
    crowd: { x: 1250, y: 650, w: 180, h: 180 },
    z: 5,
    hero: { title: 'RÉSUMÉ', line: 'Just the facts. One page.' },
  },
];

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<
  SectionId,
  Section
>;

export const site = {
  name: 'ASHITA TANEJA',
  tagline: 'DESIGNER + RESEARCHER · HOVER TO MEET THE MOODS · CLICK ONE TO GO INSIDE',
  email: 'taneja.ashita@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ashita-taneja-2000/',
  resumePdf: '/resume.pdf',
  /** Form endpoint (e.g. Formspree). Empty means the mailto: fallback. Set VITE_CONTACT_ENDPOINT. */
  contactEndpoint: (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim() || '',
};
