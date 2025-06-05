import { z } from "zod";

type RichMessageBlock = {
  schema: z.ZodSchema;
};

export const ctaBlock: RichMessageBlock = {
  schema: z.object({
    title: z.string({ description: "Title of the CTA" }),
    description: z.string({ description: "Description of the CTA" }),
    link: z.string({ description: "Link of the CTA" }),
    ctaButtonLabel: z.string({ description: "Label of the CTA button" }),
  }),
};

export const richMessageBlocks: Record<string, RichMessageBlock> = {
  cta: ctaBlock,
};
