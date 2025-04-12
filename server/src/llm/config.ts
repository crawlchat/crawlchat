import { LlmModel } from "libs/prisma";

export type LlmConfig = {
  model: string;
  apiKey: string;
  ragTopN: number;
  baseURL?: string;
};

export const getConfig = (model?: LlmModel | null): LlmConfig => {
  if (model === LlmModel.sonnet_3_7) {
    return {
      model: "claude-3-7-sonnet-20250219",
      apiKey: process.env.ANTHROPIC_API_KEY!,
      ragTopN: 1,
      baseURL: "https://api.anthropic.com/v1",
    };
  }
  return {
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY!,
    ragTopN: 4,
  };
};
