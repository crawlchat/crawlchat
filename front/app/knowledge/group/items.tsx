import {
  Badge,
  Group,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
  Center,
  Box,
  Spinner,
} from "@chakra-ui/react";
import type { Route } from "./+types/items";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import { TbCheck, TbRefresh, TbX, TbStack } from "react-icons/tb";
import { Link, Outlet } from "react-router";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { EmptyState } from "~/components/ui/empty-state";
import { Tooltip } from "~/components/ui/tooltip";
import { useEffect, useState } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const knowledgeGroup = await prisma.knowledgeGroup.findUnique({
    where: { id: params.groupId },
  });

  if (!knowledgeGroup) {
    throw new Response("Not found", { status: 404 });
  }

  const items = await prisma.scrapeItem.findMany({
    where: { scrapeId: scrape.id, knowledgeGroupId: params.groupId },
    select: {
      id: true,
      url: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  return { scrape, items, knowledgeGroup };
}

function getKey(item: { id: string; url?: string | null }) {
  if (!item.url) {
    return item.id;
  }

  try {
    return new URL(item.url).pathname;
  } catch (error) {}

  return item.url;
}

function truncateEnd(text: string, maxLength: number) {
  const prefix = text.length > maxLength ? "..." : "";
  const postfix = text.slice(Math.max(0, text.length - maxLength));

  return prefix + postfix;
}

function truncateStart(text: string, maxLength: number) {
  const prefix = text.slice(0, maxLength);
  const postfix = text.length > maxLength ? "..." : "";

  return prefix + postfix;
}

export default function ScrapeLinks({ loaderData }: Route.ComponentProps) {
  const [maxLength, setMaxLength] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setMaxLength(Math.floor(window.innerWidth / 40));
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (maxLength === 0) {
    return (
      <Center h="200px" w="full">
        <Spinner />
      </Center>
    );
  }

  return (
    <>
      {loaderData.items.length === 0 && (
        <Center w="full" h="full">
          <EmptyState
            title="No items"
            description="Scrape your documents to get started."
            icon={<TbStack />}
          />
        </Center>
      )}
      {loaderData.items.length > 0 && (
        <Stack>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader display={["none", "none", "table-cell"]}>
                  Key
                </Table.ColumnHeader>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader display={["none", "none", "table-cell"]}>
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader>
                  Updated
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loaderData.items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell
                    className="group"
                    display={["none", "none", "table-cell"]}
                  >
                    <Tooltip content={item.url}>
                      <Text>{truncateEnd(getKey(item), maxLength)}</Text>
                    </Tooltip>
                  </Table.Cell>

                  <Table.Cell>
                    <ChakraLink asChild variant={"underline"}>
                      <Link to={`/knowledge/item/${item.id}`}>
                        {truncateStart(item.title?.trim() || "-", maxLength)}
                      </Link>
                    </ChakraLink>
                  </Table.Cell>

                  <Table.Cell display={["none", "none", "table-cell"]}>
                    <Badge
                      variant={"surface"}
                      colorPalette={
                        item.status === "completed"
                          ? "brand"
                          : item.status === "failed"
                          ? "red"
                          : "gray"
                      }
                    >
                      {item.status === "completed" ? (
                        <TbCheck />
                      ) : item.status === "failed" ? (
                        <TbX />
                      ) : (
                        <TbRefresh />
                      )}
                      {item.status === "completed" ? "Success" : "Failed"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {moment(item.updatedAt).fromNow()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Outlet />
        </Stack>
      )}
    </>
  );
}
