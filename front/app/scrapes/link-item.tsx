import { prisma } from "~/prisma";
import type { Route } from "./+types/link-item";
import { getAuthUser } from "~/auth/middleware";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { redirect, useFetcher, useNavigate } from "react-router";
import { MarkdownProse } from "~/widget/markdown-prose";
import { TbTrash, TbX } from "react-icons/tb";
import { IconButton, Spinner } from "@chakra-ui/react";
import { Tooltip } from "~/components/ui/tooltip";
import { getSessionScrapeId } from "./util";

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
  const [open, setOpen] = useState(false);
  const [deleteActive, setDeleteActive] = useState(false);
  const deleteFetcher = useFetcher();

  const navigate = useNavigate();
  useEffect(() => {
    setOpen(true);
  }, []);

  function close() {
    setOpen(false);
    setTimeout(() => {
      navigate("/knowledge");
    }, 100);
  }

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
    <DrawerRoot
      open={open}
      onOpenChange={(e) => !e.open && close()}
      size={"xl"}
    >
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Scraped Markdown</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <MarkdownProse>{loaderData.item?.markdown}</MarkdownProse>
        </DrawerBody>
        <DrawerFooter>
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
          <Button onClick={close}>
            <TbX />
            Close
          </Button>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  );
}
