import { useEffect } from "react";
import toast from "react-hot-toast";
import { TbCheck, TbPlus } from "react-icons/tb";
import { useFetcher } from "react-router";
import { hideModal } from "~/components/daisy-utils";

export function NewCollectionModal() {
  const fetcher = useFetcher();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("created")) {
      hideModal("new-collection-dialog");
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  return (
    <dialog id="new-collection-dialog" className="modal">
      <div className="modal-box">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="create-collection" />
          <h3 className="font-bold text-lg flex gap-2 items-center">
            <TbPlus />
            New collection
          </h3>
          <div className="py-4">
            <div className="text-base-content/50">
              A collection lets you setup your knowledge base and lets you
              connect bot on multiple channels.
            </div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Give it a name</legend>
              <input
                type="text"
                name="name"
                className="input w-full"
                placeholder="Ex: MyBot"
                required
              />
            </fieldset>
          </div>
          <div className="modal-action">
            <button
              className="btn"
              type="button"
              onClick={() => hideModal("new-collection-dialog")}
            >
              Close
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle" && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Create
              <TbCheck />
            </button>
          </div>
        </fetcher.Form>
      </div>
    </dialog>
  );
}
