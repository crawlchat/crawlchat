import { faker } from "@faker-js/faker";
export { AiModel, models, oldModels } from "./models";
export {
  getBalance,
  addCreditTransaction,
  updateCreditSnapshot,
  updateAllCreditSnapshots,
} from "./credit-transaction";

export function name() {
  return faker.person.firstName();
}
