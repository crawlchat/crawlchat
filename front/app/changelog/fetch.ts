import { readPosts } from "~/blog/posts";
import { Cache } from "~/cache";

export const cache = new Cache(
  () => readPosts("changelog").filter((b) => b.type === "changelog"),
  5 * 60 * 1000
);
