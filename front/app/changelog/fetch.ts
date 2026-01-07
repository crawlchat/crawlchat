import { readPosts } from "~/blog/posts";
import { Cache } from "~/components/cache";

export const cache = new Cache(
  () => readPosts("changelog").filter((b) => b.type === "changelog"),
  5 * 60 * 1000
);

export function getLatestChangelog() {
  const posts = cache.get();
  return posts[0];
}
