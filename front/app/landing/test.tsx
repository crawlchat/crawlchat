import { name } from "libs";
import type { Route } from "./+types/test";

export function loader() {
  return {
    name: name(),
  };
}

export default function Test({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.name}</div>;
}
