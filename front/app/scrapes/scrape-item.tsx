import { prisma } from "~/prisma";
import type { Route } from "./+types/scrape-item";
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
import { useNavigate } from "react-router";
import { MarkdownProse } from "~/widget/markdown-prose";
import { TbX } from "react-icons/tb";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const item = await prisma.scrapeItem.findUnique({
    where: { id: params.itemId, userId: user!.id },
  });
  return { item, scrapeId: params.id };
}

export default function ScrapeItem({ loaderData }: Route.ComponentProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setOpen(true);
  }, []);

  function close() {
    setOpen(false);
    setTimeout(() => {
      navigate(`/collections/${loaderData.scrapeId}/links`);
    }, 100);
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
          <DrawerTitle>
            Scraped Markdown
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <MarkdownProse>{loaderData.item?.markdown}</MarkdownProse>
        </DrawerBody>
        <DrawerFooter>
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
