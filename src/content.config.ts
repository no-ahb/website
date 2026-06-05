import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    year: z.string(),
    medium: z.string(),
    types: z.array(z.string()),
    summary: z.string(),
    thumbnail: z.string().optional(),
    thumbnailPosition: z.string().optional(),
    videoPreview: z.string().optional(),
    video: z.string().optional(),
    videoType: z.enum(['vimeo', 'youtube']).optional(),
    videosBelow: z.array(z.object({
      url: z.string(),
      type: z.enum(['vimeo', 'youtube', 'local']),
    })).default([]),
    bandcamp: z.string().optional(),
    bandcampHeight: z.number().default(120),
    bandcampLayout: z.enum(['square', 'horizontal']).default('square'),
    bandcampNote: z.string().optional(),
    audioFile: z.string().optional(),
    audioNote: z.string().optional(),
    audioFiles: z.array(z.object({
      src: z.string(),
      note: z.string().optional(),
    })).default([]),
    exhibitionDescription: z.string().optional(),
    scorePdf: z.string().optional(),
    images: z.array(z.string()).default([]),
    exhibitions: z.array(z.object({
      venue: z.string(),
      location: z.string(),
      year: z.string(),
      note: z.string().optional(),
    })).default([]),
    sortOrder: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

// Engineering portfolio ("/log"). Sibling of `works`: overlapping field names
// (summary, sortOrder, draft, videoType, videosBelow, audioFiles, images) are kept
// identical so the detail route can reuse the works render code. Engineering fields
// (tags, stack, project, repo, updated) are additive. Unlisted until it earns nav.
const log = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),           // optional tagline rendered under the title
    summary: z.string(),                       // → meta description (Base truncates to 155)
    updated: z.string().optional(),            // display only — NOT used for sort
    categories: z.array(z.enum(['Patches & UI', 'Hardware & PCBs', 'Data & ML'])).default([]), // index filter facets; a study can sit under more than one
    draft: z.boolean().default(false),         // visibility gate (same semantics as works)
    sortOrder: z.number().default(0),          // portfolio order, sorted descending
    tags: z.array(z.string()).default([]),     // hardware / firmware / dsp / ml / web
    stack: z.array(z.string()).default([]),    // KiCad, SuperCollider, Daisy, Pico, vanilla JS…
    project: z.string().optional(),            // optional link to an art page, e.g. "/works/north-sea/"
    repo: z.string().optional(),               // optional source URL
    demo: z.string().optional(),               // optional live-demo URL
    hero: z.string().optional(),
    heroPosition: z.string().optional(),
    heroFit: z.enum(['cover', 'contain']).optional(), // 'contain' shows the whole image (e.g. a UI screenshot) instead of cover-cropping it to a banner

    thumb: z.string().optional(),              // index hover-preview image (defaults to hero / first image)
    thumbRotate: z.number().default(0),        // degrees to rotate the hover-preview image (orientation fix)
    images: z.array(z.string()).default([]),
    video: z.string().optional(),
    videoPoster: z.string().optional(),       // poster frame for video embeds (defaults to hero)
    videoType: z.enum(['vimeo', 'youtube']).optional(),
    videosBelow: z.array(z.object({
      url: z.string(),
      type: z.enum(['vimeo', 'youtube', 'local']),
    })).default([]),
    audioFiles: z.array(z.object({
      src: z.string(),
      note: z.string().optional(),
    })).default([]),
  }),
});

export const collections = { works, log };
