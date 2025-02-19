import { Badge, Stack, Table, Text } from "@chakra-ui/react";
import type { Route } from "./+types/scrape-links";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import { TbCheck } from "react-icons/tb";

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
    select: { id: true, url: true, title: true, createdAt: true },
  });

  return { scrape, items };
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
            <Table.ColumnHeader>Created</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loaderData.items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.url}</Table.Cell>
              <Table.Cell>{item.title}</Table.Cell>
              <Table.Cell>
                <Badge variant={"surface"} colorPalette={"brand"}>
                  <TbCheck />
                  Success
                </Badge>
              </Table.Cell>
              <Table.Cell>{moment(item.createdAt).fromNow()}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}
