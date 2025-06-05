import { LlmModel } from "libs/prisma";

export type LlmConfig = {
  model: string;
  apiKey: string;
  ragTopN: number;
  creditsPerMessage: number;
  baseURL?: string;
};

export const getConfig = (model?: LlmModel | null): LlmConfig => {
  if (model === "o3_mini") {
    return {
      model: "o3-mini",
      apiKey: process.env.OPENAI_API_KEY!,
      ragTopN: 2,
      creditsPerMessage: 1,
    };
  }
  if (model === LlmModel.sonnet_3_5) {
    return {
      model: "claude-3-5-sonnet-20241022",
      apiKey: process.env.ANTHROPIC_API_KEY!,
      ragTopN: 2,
      baseURL: "https://api.anthropic.com/v1",
      creditsPerMessage: 4,
    };
  }
  if (model === LlmModel.sonnet_3_7) {
    return {
      model: "claude-3-7-sonnet-20250219",
      apiKey: process.env.ANTHROPIC_API_KEY!,
      ragTopN: 2,
      baseURL: "https://api.anthropic.com/v1",
      creditsPerMessage: 4,
    };
  }
  if (model === LlmModel.gemini_2_5_flash) {
    return {
      model: "gemini-2.5-flash-preview-05-20",
      apiKey: process.env.GEMINI_API_KEY!,
      ragTopN: 4,
      creditsPerMessage: 1,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    };
  }
  return {
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY!,
    ragTopN: 4,
    creditsPerMessage: 1,
  };
};
