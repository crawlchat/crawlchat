import { faker } from "@faker-js/faker";

export function name() {
  return faker.person.firstName();
}
