import { AiModel } from "./models";
import crypto from "crypto";

export type AiApiKey = {
  key: string;
  byok: boolean;
};

export const getAiApiKey = (
  model: AiModel,
  keys: {
    openrouter?: string;
  }
): AiApiKey => {
  if (model.baseURL === "https://openrouter.ai/api/v1") {
    if (!keys.openrouter) {
      return {
        key: process.env.OPENROUTER_API_KEY!,
        byok: false,
      };
    }
    return {
      key: decryptAiApiKey(keys.openrouter!),
      byok: true,
    };
  }
  if (model.baseURL === "https://api.anthropic.com/v1") {
    return {
      key: process.env.ANTHROPIC_API_KEY!,
      byok: false,
    };
  }
  if (
    model.baseURL === "https://generativelanguage.googleapis.com/v1beta/openai/"
  ) {
    return {
      key: process.env.GEMINI_API_KEY!,
      byok: false,
    };
  }
  if (model.baseURL === "https://api.openai.com/v1") {
    return {
      key: process.env.OPENAI_API_KEY!,
      byok: false,
    };
  }
  throw new Error(`Unknown base URL: ${model.baseURL}`);
};

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

const getEncryptionKey = (): Buffer => {
  const secret = process.env.AI_API_KEY_SECRET!;
  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptAiApiKey = (key: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
};

export const decryptAiApiKey = (encryptedKey: string): string => {
  const buf = Buffer.from(encryptedKey, "hex");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv
  );
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
};
