import OpenAI from "openai";
import type { Message } from "libs/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askLLM(
  query: string,
  messages: Message[],
  options?: {
    url?: string;
    context?: string;
    systemPrompt?: string;
  }
) {
  return await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      ...messages.map((message) => message.llmMessage as any),
      {
        role: "system",
        content: `If context is not provided, don't answer the question.
Don't hallucinate. Don't make the answers too long.
If the context does not contain the answer, say that you don't have information about it and sugges few more questions around it.`,
      },
      {
        role: "system",
        content: options?.systemPrompt ?? "You are a helpful assistant.",
      },
      {
        role: "user",
        content: `${query}\n\nContext:\n${options?.context ?? ""}`,
      },
    ],
    stream: true,
  });
}
