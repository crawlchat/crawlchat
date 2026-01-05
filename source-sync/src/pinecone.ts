import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export function makeRecordId(scrapeId: string, id: string) {
  return `${scrapeId}/${id}`;
}

export async function deleteScrape(indexerKey: string, scrapeId: string) {
  const index = pc.index(indexerKey);

  let page;

  do {
    page = await index.listPaginated({
      prefix: scrapeId,
      paginationToken: page?.pagination?.next,
    });
    const ids = page.vectors?.map((vector) => vector.id) ?? [];

    if (ids.length === 0) {
      break;
    }

    await index.deleteMany(ids);
  } while (page.pagination?.next);
}

export async function deleteByIds(indexerKey: string, ids: string[]) {
  if (ids.length === 0) {
    return;
  }
  const index = pc.index(indexerKey);
  await index.deleteMany(ids);
}
