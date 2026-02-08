import { faker } from "@faker-js/faker";
export { AiModel, models, oldModels } from "./models";
export {
  AiApiKey,
  getAiApiKey,
  encryptAiApiKey,
  decryptAiApiKey,
} from "./ai-api-key";

export function name() {
  return faker.person.firstName();
}
