import type { CaseStudy } from './types';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'bharosa',
    title: 'BHAROSA', // working title for the M.Des thesis
    eyebrow: 'CASE STUDY 01 · M.DES THESIS',
    summary:
      'How adults with visual impairment in India plan money, and how far they would trust AI to help.',
    tags: ['23 participants', 'Field research', 'AI trust'],
    cover: '[PLACEHOLDER]',
    panels: [
      {
        stage: 'problem',
        mood: 'worried',
        title: 'Money is hard. Harder when apps are not built for you.',
        body: 'Adults with visual impairment (VI) in India manage money through apps, cash and people they trust. I wanted to understand how they plan and decide, not only how they pay.',
      },
      {
        stage: 'research',
        mood: 'curious',
        stat: '23',
        title: 'conversations: 13 VI, 10 sighted',
        body: 'Field visits including NAB Delhi, an 11-step qualitative pipeline, and one honest pivot: my first finding did not hold up, so I moved from access to planning.',
      },
      {
        stage: 'insight',
        mood: 'surprised',
        title: 'Advice, yes. Autopilot, never.',
        body: 'Almost everyone wanted AI to advise on money decisions. Almost no one wanted it to act on its own.',
      },
      {
        stage: 'solution',
        mood: 'smile',
        title: '[PLACEHOLDER: design response]',
        body: '[PLACEHOLDER]',
      },
      {
        stage: 'impact',
        mood: 'proud',
        title: '[PLACEHOLDER: what changed]',
        body: '[PLACEHOLDER]',
      },
    ],
  },
  {
    slug: 'aangan',
    title: 'AANGAN',
    eyebrow: 'CASE STUDY 02',
    summary: 'A village courtyard where families aged 40–70 live as neighbours again.',
    tags: ['n=39 survey', 'Interviews', 'Playful UX'],
    panels: [],
  },
  {
    slug: 'hand-it-over',
    title: 'HAND IT OVER',
    eyebrow: 'CASE STUDY 03',
    summary: 'Why handing your phone to someone feels risky in Indian homes.',
    tags: ['40-person survey', 'Diary study', 'Privacy'],
    panels: [],
  },
  {
    slug: 'clearcase',
    title: 'CLEARCASE',
    eyebrow: 'CASE STUDY 04',
    summary: 'Keeping humans in charge when AI rejects an ad.',
    tags: ['AI oversight', 'Product design'],
    panels: [],
  },
  {
    slug: 'lumen',
    title: 'LUMEN',
    eyebrow: 'CASE STUDY 05',
    summary: 'A design system migrated, audited and documented in Figma.',
    tags: ['Design systems', 'Figma'],
    panels: [],
  },
  {
    slug: 'agent-project',
    title: '[AGENT PROJECT]',
    eyebrow: 'CASE STUDY 06',
    summary: 'Overseeing AI agents that negotiate with each other.',
    tags: ['AI agents', 'Oversight'],
    panels: [],
  },
];

export const defaultStageMood = {
  problem: 'worried',
  research: 'curious',
  insight: 'surprised',
  solution: 'smile',
  impact: 'proud',
} as const;
