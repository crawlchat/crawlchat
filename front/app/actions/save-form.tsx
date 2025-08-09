import { useContext } from "react";
import { EditActionContext } from "./use-edit-action";
import { NavLink, type FetcherWithComponents } from "react-router";
import { Button } from "~/components/ui/button";
import { IconButton, Spinner, Text } from "@chakra-ui/react";
import { TbCheck, TbTrash, TbX } from "react-icons/tb";

export function SaveForm({
  fetcher,
  deleteFetcher,
}: {
  fetcher: FetcherWithComponents<any>;
  deleteFetcher?: FetcherWithComponents<any>;
}) {
  const { title, url, method, data, headers, canSubmit, description } =
    useContext(EditActionContext);

  return (
    <>
      <Button variant={"subtle"} asChild>
        <NavLink to="/actions" prefetch="intent" replace>
          {({ isPending }) => (
            <>
              {isPending ? <Spinner /> : <TbX />}
              <Text>Cancel</Text>
            </>
          )}
        </NavLink>
      </Button>
      {deleteFetcher && (
        <deleteFetcher.Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <IconButton
            colorPalette={"red"}
            type="submit"
            disabled={deleteFetcher.state !== "idle"}
          >
            <TbTrash />
          </IconButton>
        </deleteFetcher.Form>
      )}
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="update" />
        <input
          type="hidden"
          name="data"
          value={JSON.stringify({
            title,
            url,
            method,
            data,
            headers,
            description,
          })}
        />
        <Button
          colorPalette={"brand"}
          disabled={!canSubmit}
          type="submit"
          loading={fetcher.state !== "idle"}
        >
          Save
          <TbCheck />
        </Button>
      </fetcher.Form>
    </>
  );
}
