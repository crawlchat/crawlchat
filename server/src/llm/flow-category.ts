import { Message } from "libs/prisma";
import { multiLinePrompt, SimpleAgent } from "./agentic";
import { Flow } from "./flow";
import { z } from "zod";

const categoryMakerAgent = new SimpleAgent({
  id: "category-maker-agent",
  prompt: multiLinePrompt([
    "Your job is to group the above messages into categories. You cannot give more than 5 categories.",
    "Example categories: 'Pricing', 'Features', 'Getting started', 'FAQ', 'Billing'",
    "Make them specific to the topic of the messages",
    "You cannot miss out any message without assigning a category.",
    "You can have a category called 'Other' if you think it doesn't fit into any other category.",
    "Don't repeat the same category name in the list.",
  ]),
  schema: z.object({
    categories: z.array(
      z.object({
        key: z.string({ description: "Alphanumeric lowercase unique id" }),
        name: z.string(),
        description: z.string(),
      })
    ),
  }),
});

export function makeCategoryMakerFlow(messages: Message[]) {
  const flow = new Flow(
    [categoryMakerAgent],
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

const assignCategoryAgent = new SimpleAgent({
  id: "assign-category-agent",
  prompt: multiLinePrompt([
    "Given the list of categories and a message, you need to assign the category to the message.",
    "If the appropriate category is not present in the list, you can create a new category.",
    "Leave categoryKey empty if you are creating a new category.",
    "Leave newCategory empty if you are not creating a new category.",
    "Don't repeat the same category name in the list.",
    "Don't create new categories unnecessarily. Use the existing categories as much as possible.",
  ]),
  schema: z.object({
    key: z.string({
      description:
        "Category key as exactly mentioned in the above context json",
    }),
    name: z.string(),
    description: z.string(),
  }),
});

export function makeAssignCategoryFlow(categories: unknown[], message: string) {
  const flow = new Flow(
    [assignCategoryAgent],
    {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: JSON.stringify({
              categories,
              message,
            }),
          },
        },
      ],
    },
    { repeatToolAgent: false }
  );

  flow.addNextAgents(["assign-category-agent"]);

  return flow;
}
