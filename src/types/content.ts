import { z } from "zod";

export const guideSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  description: z.string(),
  eyebrow: z.string(),
  updated: z.string(),
  sources: z.array(z.string()),
  sections: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
      bullets: z.array(z.string()).optional(),
    }),
  ),
  comparison: z.array(z.tuple([z.string(), z.string(), z.string()])).optional(),
});
export type Guide = z.infer<typeof guideSchema>;
export const newsSchema = z.object({
  updatedAt: z.string(),
  feed: z.url(),
  items: z.array(
    z.object({
      title: z.string(),
      url: z.url(),
      date: z.string(),
      source: z.string(),
      category: z.string(),
    }),
  ),
});
export const talentSchema = z.object({
  build: z.string(),
  generated: z.string(),
  attribution: z.string(),
  licence: z.string(),
  points_at_level_60: z.number(),
  levels_that_grant_a_point: z.array(z.number()),
  classes: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      page: z.url(),
      trees: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          rows: z.number(),
          columns: z.number(),
          talents: z.array(
            z.object({
              id: z.number(),
              name: z.string().nullable(),
              row: z.number(),
              column: z.number(),
              max_ranks: z.number(),
              points_required: z.number(),
              requires: z.array(z.number()),
              spell_id: z.number().nullable(),
              icon_id: z.number().nullable(),
              description: z.array(z.string()).optional(),
            }),
          ),
        }),
      ),
    }),
  ),
});
export type TalentDataset = z.infer<typeof talentSchema>;
export type TalentClass = TalentDataset["classes"][number];
export type Talent = TalentClass["trees"][number]["talents"][number];
