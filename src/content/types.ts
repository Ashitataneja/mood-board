export type SectionId = 'work' | 'about' | 'writing' | 'gallery' | 'contact' | 'resume';

export type ShapeId = 'squircle' | 'flower' | 'arch' | 'starburst' | 'cloud' | 'square';

export type MoodId =
  | 'intense'
  | 'wink'
  | 'sleepy'
  | 'open'
  | 'grin'
  | 'deadpan'
  | 'worried'
  | 'curious'
  | 'surprised'
  | 'smile'
  | 'proud'
  | 'asleep'
  | 'flinch'
  | 'blush';

export type Stage = 'problem' | 'research' | 'insight' | 'solution' | 'impact';

export interface CrowdSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Section {
  id: SectionId;
  name: string;
  path: string;
  shape: ShapeId;
  /** CSS custom property holding the body colour */
  color: string;
  /** Section background, when it differs from the body colour (Writing is darker) */
  bg?: string;
  /** Text colour on this background (WCAG AA pairing from the brief) */
  text: 'paper' | 'ink';
  defaultMood: MoodId;
  hoverLine: string;
  /** Position on the 1440×900 landing canvas */
  crowd: CrowdSlot;
  /** Draw order on the landing (0 = back) */
  z: number;
  hero: { title: string; line: string };
}

export interface CaseStudyPanel {
  stage: Stage;
  mood: MoodId;
  title: string;
  body: string;
  stat?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  tags: string[];
  cover?: string;
  panels: CaseStudyPanel[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Placeholder colour used until a real image is added */
  placeholder?: string;
}
