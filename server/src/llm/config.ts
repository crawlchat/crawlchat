import { AiModel, models, oldModels } from "@packages/common";

export type LlmConfig = AiModel;

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

export const getConfig = (model?: string | null): LlmConfig => {
  if (!model) {
    return models["openrouter/openai/gpt-4o-mini"];
  }

  if (oldModels[model]) {
    return oldModels[model];
  }

  if (models[model]) {
    return models[model];
  }

  throw new Error(`Unknown model: ${model}`);
};
