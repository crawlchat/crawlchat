import { faker } from "@faker-js/faker";
export { AiModel, models, oldModels } from "./models";

export function name() {
  return faker.person.firstName();
}
