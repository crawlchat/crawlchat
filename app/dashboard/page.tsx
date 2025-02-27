import {
  GridItem,
  Group,
  SimpleGrid,
  Stack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import type { Route } from "./+types/page";
import { TbHome, TbInbox, TbPlus } from "react-icons/tb";
import { Link } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import { ScrapeCard } from "~/scrapes/card";
import { Page } from "~/components/page";
import { EmptyState } from "~/components/ui/empty-state";
import { Button } from "~/components/ui/button";

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
    itemsCount[scrape.id] = await prisma.scrapeItem.count({
      where: {
        scrapeId: scrape.id,
      },
    });
  }
  return {
    user,
    scrapes,
    itemsCount,
  };
}

export function meta() {
  return [
    {
      title: "CrawlChat",
      description: "Chat with any website!",
    },
  ];
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const cardsToShow = 4;

  return (
    <Page title="Home" icon={<TbHome />}>
      <Stack
        alignItems={"center"}
        justifyContent={"center"}
        height={"100%"}
        gap={8}
      >
        {loaderData.scrapes.length === 0 ? (
          <Stack maxW="400px" w="full" alignItems="center" gap={6}>
            <EmptyState
              icon={<TbInbox size={60} opacity={0.6} />}
              title="No collections yet"
              description="Start by scraping a website to create your first collection"
            >
              <Button mt={4} asChild colorPalette={"brand"}>
                <Link to="/scrape">
                  Create collection
                  <TbPlus />
                </Link>
              </Button>
            </EmptyState>
          </Stack>
        ) : (
          <Stack maxW={"500px"} w={"full"}>
            <SimpleGrid columns={2} gap={4}>
              {loaderData.scrapes.slice(0, cardsToShow).map((scrape) => (
                <GridItem key={scrape.id}>
                  <ScrapeCard
                    scrape={scrape}
                    itemsCount={loaderData.itemsCount[scrape.id]}
                  />
                </GridItem>
              ))}
            </SimpleGrid>
            <Group justifyContent={"flex-end"}>
              {loaderData.scrapes.length > cardsToShow && (
                <ChakraLink asChild variant={"underline"}>
                  <Link to="/collections">View all</Link>
                </ChakraLink>
              )}
            </Group>
          </Stack>
        )}
      </Stack>
    </Page>
  );
}
