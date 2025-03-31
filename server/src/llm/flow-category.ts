import { Message } from "libs/prisma";
import { multiLinePrompt, SimpleAgent } from "./agentic";
import { Flow } from "./flow";
import { z } from "zod";

const agent = new SimpleAgent({
  id: "category-maker-agent",
  prompt: multiLinePrompt([
    "Your job is to group the above messages into categories. You cannot give more than 5 categories.",
    "Example categories: 'Pricing', 'Features', 'Getting started', 'FAQ', 'Billing'",
    "Make them specific to the topic of the messages",
    "You cannot miss out any message without assigning a category.",
    "You can have a category called 'Other' if you think it doesn't fit into any other category.",
  ]),
  schema: z.object({
    categories: z.array(
      z.object({
        key: z.string({ description: "Alphanumeric lowercase unique id" }),
        name: z.string(),
        description: z.string(),
        messageIds: z.array(
          z.object({
            id: z.string({ description: "Message id" }),
          })
        ),
      })
    ),
  }),
});

export function makeCategoryFlow(messages: Message[]) {
  const flow = new Flow(
    [agent],
    {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: JSON.stringify(
              messages.map((message) => ({
                id: message.id,
                content: message.llmMessage,
              }))
            ),
          },
        },
      ],
    },
    { repeatToolAgent: false }
  );

  flow.addNextAgents(["category-maker-agent"]);

  return flow;
}
