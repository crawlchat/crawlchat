import { AiModel, models, oldModels } from "@packages/common";

export type LlmConfig = AiModel & {
  apiKey: string;
};

type ParsedModelString = {
  model: string;
  company?: string;
  provider?: string;
};

export function parseModelString(model: string): ParsedModelString {
  const parts = model.split("/");
  if (parts.length === 1) {
    return {
      model: model,
    };
  }
  if (parts.length === 2) {
    return {
      company: parts[0],
      model: parts[1],
    };
  }
  return {
    provider: parts[0],
    company: parts[1],
    model: parts[2],
  };
}

function getApiKey(model: AiModel): string {
  if (model.baseURL === "https://openrouter.ai/api/v1") {
    return process.env.OPENROUTER_API_KEY!;
  }
  if (model.baseURL === "https://api.anthropic.com/v1") {
    return process.env.ANTHROPIC_API_KEY!;
  }
  if (
    model.baseURL === "https://generativelanguage.googleapis.com/v1beta/openai/"
  ) {
    return process.env.GEMINI_API_KEY!;
  }
  if (model.baseURL === "https://api.openai.com/v1") {
    return process.env.OPENAI_API_KEY!;
  }
  throw new Error(`Unknown base URL: ${model.baseURL}`);
}

export const getConfig = (model?: string | null): LlmConfig => {
  if (!model) {
    return {
      ...models["openrouter/openai/gpt-4o-mini"],
      apiKey: getApiKey(models["openrouter/openai/gpt-4o-mini"]),
    };
  }

  if (oldModels[model]) {
    return {
      ...oldModels[model],
      apiKey: getApiKey(oldModels[model]),
    };
  }

  if (models[model]) {
    return {
      ...models[model],
      apiKey: getApiKey(models[model]),
    };
  }

  throw new Error(`Unknown model: ${model}`);
};
