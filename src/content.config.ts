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
      type: z.enum(['vimeo', 'youtube']),
    })).default([]),
    bandcamp: z.string().optional(),
    bandcampHeight: z.number().default(120),
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

export const collections = { works };
