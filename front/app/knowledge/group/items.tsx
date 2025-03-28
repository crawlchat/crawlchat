import {
  Badge,
  Group,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
  Center,
} from "@chakra-ui/react";
import type { Route } from "./+types/items";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import { TbCheck, TbRefresh, TbX, TbStack } from "react-icons/tb";
import { Link, Outlet } from "react-router";
import { getSessionScrapeId } from "~/scrapes/util";
import { EmptyState } from "~/components/ui/empty-state";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const knowledgeGroup = await prisma.knowledgeGroup.findUnique({
    where: { id: params.groupId, userId: user!.id },
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

export default function ScrapeLinks({ loaderData }: Route.ComponentProps) {
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
                <Table.ColumnHeader w="300px" truncate>
                  Url
                </Table.ColumnHeader>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader w="120px">Status</Table.ColumnHeader>
                <Table.ColumnHeader w="200px">Updated</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loaderData.items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell className="group">
                    <Group>
                      <Text>
                        {item.url ? (
                          <ChakraLink href={item.url} target="_blank">
                            {new URL(item.url).pathname}
                          </ChakraLink>
                        ) : (
                          item.id
                        )}
                      </Text>
                    </Group>
                  </Table.Cell>
                  <Table.Cell>
                    <ChakraLink asChild variant={"underline"}>
                      <Link to={`/knowledge/item/${item.id}`}>
                        {item.title ?? "-"}
                      </Link>
                    </ChakraLink>
                  </Table.Cell>
                  <Table.Cell>
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
                  <Table.Cell>{moment(item.updatedAt).fromNow()}</Table.Cell>
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
