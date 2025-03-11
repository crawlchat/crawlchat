import {
  EmptyState,
  GridItem,
  Group,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { Stack } from "@chakra-ui/react";
import { TbFolder, TbPlus } from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/page";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import { ScrapeCard } from "./card";
import { Button } from "~/components/ui/button";
import { redirect, useFetcher } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapes = await prisma.scrape.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const itemsCount: Record<string, number> = {};
  for (const scrape of scrapes) {
    const items = await prisma.scrapeItem.count({
      where: { scrapeId: scrape.id },
    });
    itemsCount[scrape.id] = items;
  }
  return {
    user,
    scrapes,
    itemsCount,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const scrape = await prisma.scrape.create({
    data: {
      userId: user!.id,
      status: "done",
    },
  });
  return redirect(`/collections/${scrape.id}/settings`);
}

export default function ScrapesPage({ loaderData }: Route.ComponentProps) {
  const newFetcher = useFetcher();

  return (
    <Page
      title="Collections"
      icon={<TbFolder />}
      right={
        <Group>
          <newFetcher.Form method="post">
            <Button
              variant={"subtle"}
              type="submit"
              loading={newFetcher.state !== "idle"}
            >
              <TbPlus />
              New
            </Button>
          </newFetcher.Form>
        </Group>
      }
    >
      <Stack>
        <SimpleGrid columns={[1, 2, 3, 4, 5]} gap={4}>
          {loaderData.scrapes.map((scrape) => (
            <GridItem key={scrape.id}>
              <ScrapeCard
                scrape={scrape}
                itemsCount={loaderData.itemsCount[scrape.id]}
              />
            </GridItem>
          ))}
        </SimpleGrid>
        {loaderData.scrapes.length === 0 && (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <TbFolder />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No collections found</EmptyState.Title>
                <EmptyState.Description>
                  Scrape a website to get started
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        )}
      </Stack>
    </Page>
  );
}
