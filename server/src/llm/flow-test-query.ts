import { SimpleAgent } from "./agentic";
import { z } from "zod";
import { Flow } from "./flow";

const agent = new SimpleAgent({
  id: "test-query-agent",
  prompt:
    "Your job is to test if the provided text is a question and seeks an answer.",
  schema: z.object({
    isQuestion: z.boolean(),
    confidence: z.number(),
  }),
});

export function makeTestQueryFlow(text: string) {
  const flow = new Flow([agent], {
    messages: [{ llmMessage: { role: "user", content: text } }],
  });

  flow.addNextAgents(["test-query-agent"]);

  return flow;
}
