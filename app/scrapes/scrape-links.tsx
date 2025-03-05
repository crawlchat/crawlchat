import {
  Badge,
  Group,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import type { Route } from "./+types/scrape-links";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import { TbCheck, TbRefresh, TbX } from "react-icons/tb";
import { Tooltip } from "~/components/ui/tooltip";
import { Link, Outlet } from "react-router";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const items = await prisma.scrapeItem.findMany({
    where: { scrapeId: scrape.id },
    select: {
      id: true,
      url: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  return { scrape, items };
}

function LinkRefresh({ scrapeId, url }: { scrapeId: string; url: string }) {
  return (
    <Tooltip
      content="Refresh content"
      positioning={{ placement: "top" }}
      showArrow
    >
      <Link to={`/scrape?url=${url}&collection=${scrapeId}&links=1`}>
        <TbRefresh />
      </Link>
    </Tooltip>
  );
}

export default function ScrapeLinks({ loaderData }: Route.ComponentProps) {
  return (
    <Stack>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Url</Table.ColumnHeader>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Updated</Table.ColumnHeader>
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
                  {item.url && (
                    <LinkRefresh
                      scrapeId={loaderData.scrape.id}
                      url={item.url}
                    />
                  )}
                </Group>
              </Table.Cell>
              <Table.Cell>
                <ChakraLink asChild>
                  <Link to={item.id}>{item.title ?? "-"}</Link>
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
  );
}
