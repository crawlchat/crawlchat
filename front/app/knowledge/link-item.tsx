import { prisma } from "~/prisma";
import type { Route } from "./+types/link-item";
import { getAuthUser } from "~/auth/middleware";
import { useState } from "react";
import { redirect, useFetcher } from "react-router";
import { MarkdownProse } from "~/widget/markdown-prose";
import { TbBook2, TbTrash } from "react-icons/tb";
import { Group, IconButton, Spinner, Stack } from "@chakra-ui/react";
import { Tooltip } from "~/components/ui/tooltip";
import { getSessionScrapeId } from "~/scrapes/util";
import { Page } from "~/components/page";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const item = await prisma.scrapeItem.findUnique({
    where: { id: params.itemId, userId: user!.id },
  });
  return { item, scrapeId };
}

export async function action({ params, request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  if (request.method === "DELETE") {
    await prisma.scrapeItem.delete({
      where: { id: params.itemId, userId: user!.id },
    });
    return redirect("/knowledge");
  }
}

export default function ScrapeItem({ loaderData }: Route.ComponentProps) {
  const [deleteActive, setDeleteActive] = useState(false);
  const deleteFetcher = useFetcher();

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    if (!deleteActive) {
      setDeleteActive(true);
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        setDeleteActive(false);
      }, 3000);
      return;
    }
  }

  return (
    <Page
      title={loaderData.item?.title ?? "Untitled"}
      icon={<TbBook2 />}
      right={
        <Group>
          <deleteFetcher.Form method="delete">
            <Tooltip
              content={deleteActive ? "Are you sure?" : "Delete"}
              showArrow
              open={deleteActive || undefined}
            >
              <IconButton
                colorPalette={"red"}
                variant={deleteActive ? "solid" : "subtle"}
                type={deleteActive ? "submit" : "button"}
                onClick={handleDelete}
                disabled={deleteFetcher.state !== "idle"}
              >
                {deleteFetcher.state === "idle" ? <TbTrash /> : <Spinner />}
              </IconButton>
            </Tooltip>
          </deleteFetcher.Form>
        </Group>
      }
    >
      <Stack>
        <Stack maxW={"800px"}>
          <MarkdownProse>{loaderData.item?.markdown}</MarkdownProse>
        </Stack>
      </Stack>
    </Page>
  );
}
