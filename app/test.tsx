import { loadStore, saveStore, scrapeLoop, type ScrapeStore } from "../server/src/scrape/crawl";
import {
  extractMarkdownText,
  searchFAISS,
  storeEmbeddingsInFAISS,
} from "../server/src/vector";
import type { Route } from "./+types/test";
import { OrderedSet } from "../server/src/scrape/ordered-set";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Missing query parameter" }, { status: 400 });
  }

  console.log("query", query);

  const baseUrl = "https://reactrouter.com";

  const store: ScrapeStore = {
    urls: {},
    urlSet: new OrderedSet(),
  };
  store.urlSet.add(baseUrl);
  await scrapeLoop(store, baseUrl, {
    skipRegex: [],
  });
  await saveStore(baseUrl, store);
  await storeEmbeddingsInFAISS(baseUrl, store);
  console.log("embeddings stored");

  // const store = await loadStore(baseUrl);
  // const result = await searchFAISS(baseUrl, query, 10);
  // return Response.json(
  //   await Promise.all(
  //     result.map(async (index) => ({
  //       url: store.urlSet.get(index),
  //       index,
  //       content: store.urls[store.urlSet.get(index)!]?.markdown ?? "",
  //     }))
  //   )
  // );
}
