import type { KnowledgeGroup, ScrapeItem } from "libs/prisma";
import { TbSearch } from "react-icons/tb";
import { Link, useFetcher } from "react-router";
import { ScoreBadge } from "~/components/score-badge";

export type ItemSearchResult = {
  item: ScrapeItem;
  knowledgeGroup: KnowledgeGroup;
  score: number;
};

export default function KnowledgeSearch() {
  const fetcher = useFetcher<{ results: ItemSearchResult[] }>();

  return (
    <div className="flex flex-col gap-4">
      <fetcher.Form method="post" className="flex items-center gap-2">
        <input type="hidden" name="intent" value="search" />
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Search the knowledge base by any query"
          name="search"
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={fetcher.state !== "idle"}
        >
          {fetcher.state !== "idle" && (
            <span className="loading loading-spinner loading-xs" />
          )}
          <TbSearch />
          Search
        </button>
      </fetcher.Form>

      {fetcher.data?.results && fetcher.data.results.length > 0 && (
        <div className="overflow-x-auto bg-base-200/50 rounded-box shadow">
          <table className="table">
            <thead>
              <tr>
                <th>Group</th>
                <th>URL</th>
                <th>Title</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {fetcher.data.results.map((result) => (
                <tr key={result.item.id}>
                  <td className="truncate max-w-xs">
                    <Link
                      to={`/knowledge/group/${result.knowledgeGroup.id}`}
                      className="link link-hover link-primary"
                      prefetch="intent"
                      target="_blank"
                    >
                      {result.knowledgeGroup.title}
                    </Link>
                  </td>
                  <td className="truncate max-w-xs">
                    <Link
                      to={`/knowledge/item/${result.item.id}`}
                      className="link link-hover link-primary"
                      target="_blank"
                      prefetch="intent"
                    >
                      {result.item.url}
                    </Link>
                  </td>
                  <td className="truncate max-w-xs">
                    {result.item.title ?? "Untitled"}
                  </td>
                  <td className="truncate">
                    <ScoreBadge score={result.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
