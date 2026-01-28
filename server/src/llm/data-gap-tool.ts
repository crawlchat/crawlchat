import { multiLinePrompt } from "@packages/agentic";
import { z } from "zod";

export function makeDataGapTool() {
  return {
    id: "report_data_gap",
    description: multiLinePrompt([
      "Report a gap or missing information in the knowledge base.",
      "Use this when search_data returned results but they don't match or answer the user's query.",
      "Do NOT use this if search_data returned no results.",
      "Do NOT use this for questions unrelated to the knowledge base topic.",
    ]),
    schema: z.object({
      title: z.string({
        description: "A short title summarizing the missing information",
      }),
      description: z.string({
        description:
          "A detailed description of what information is missing and why it would be useful",
      }),
    }),
    execute: async ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
      console.log("Reporting data gap");
      console.log("Title -", title);
      console.log("Description -", description);

      return {
        content: "Data gap reported successfully. Thank you for the feedback.",
        customMessage: {
          dataGap: {
            title,
            description,
          },
        },
      };
    },
  };
}
