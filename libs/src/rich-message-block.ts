import { z } from "zod";

type RichMessageBlock = {
  schema: z.ZodSchema;
};

// export const cardsBlock: RichMessageBlock = {
//   key: "cards",
//   schema: z.array(
//     z.object({
//       title: z.string({ description: "Title of the card" }),
//       description: z.string({
//         description:
//           "Description of the card. Should be very short and concise",
//       }),
//       image: z.string({ description: "Image URL of the card" }).optional(),
//       metric: z
//         .string({
//           description:
//             "Metric of the card. It can be price, rating, etc. Should be very short. Example: $10, 3k, 5m, 10cm, etc.",
//         })
//         .optional(),
//       cta: z
//         .object({
//           text: z.string({ description: "Text of the CTA button" }),
//           link: z.string({ description: "Link of the CTA button" }),
//         })
//         .optional(),
//     })
//   ),
// };

// export const contactsBlock: RichMessageBlock = {
//   key: "contacts",
//   schema: z.array(
//     z.object({
//       name: z.string({ description: "Name of the contact" }).optional(),
//       email: z.string({ description: "Email of the contact" }).optional(),
//       phone: z
//         .string({ description: "Phone number of the contact" })
//         .optional(),
//       address: z.string({ description: "Address of the contact" }).optional(),
//       website: z.string({ description: "Website of the contact" }).optional(),
//       link: z.string({ description: "Link of the contact" }).optional(),
//     })
//   ),
// };

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
