import {
  Badge,
  Group,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
  Center,
  IconButton,
} from "@chakra-ui/react";
import type { Route } from "./+types/groups";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import {
  TbBook,
  TbBrandGithub,
  TbCheck,
  TbPlus,
  TbRefresh,
  TbWorld,
  TbX,
} from "react-icons/tb";
import { Tooltip } from "~/components/ui/tooltip";
import { Link, Outlet } from "react-router";
import { getSessionScrapeId } from "~/scrapes/util";
import { Page } from "~/components/page";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import type { KnowledgeGroupStatus, KnowledgeGroupType } from "libs/prisma";
import { useMemo } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const knowledgeGroups = await prisma.knowledgeGroup.findMany({
    where: { scrapeId: scrape.id, userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return { scrape, knowledgeGroups };
}

export default function ScrapeLinks({ loaderData }: Route.ComponentProps) {
  const groups = useMemo(() => {
    return loaderData.knowledgeGroups.map((group) => {
      let icon = <TbBook />;
      let statusText = "Unknown";

      if (group.type === "scrape_web") {
        icon = <TbWorld />;
      } else if (group.type === "scrape_github") {
        icon = <TbBrandGithub />;
      }

      if (group.status === "pending") {
        statusText = "To be processed";
      } else if (group.status === "done") {
        statusText = "Up to date";
      } else if (group.status === "error") {
        statusText = "Error";
      } else if (group.status === "processing") {
        statusText = "Updating...";
      }

      return {
        icon,
        title: group.title,
        statusText,
        type: group.type,
        updatedAt: group.updatedAt,
        id: group.id,
      };
    });
  }, [loaderData.knowledgeGroups]);

  return (
    <Page
      title="Knowledge"
      icon={<TbBook />}
      right={
        <Group>
          <Button variant={"subtle"} colorPalette={"brand"} asChild>
            <Link to="/knowledge/scrape">
              <TbPlus />
              Add
            </Link>
          </Button>
        </Group>
      }
    >
      {groups.length === 0 && (
        <Center w="full" h="full">
          <EmptyState
            title="No knowledge"
            description="Scrape your documents to get started."
          >
            <Button asChild colorPalette={"brand"}>
              <Link to="/knowledge/scrape">
                <TbPlus />
                Add
              </Link>
            </Button>
          </EmptyState>
        </Center>
      )}
      {groups.length > 0 && (
        <Stack>
          <Table.Root size="lg">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Updated</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell className="group">
                    <Group>
                      {item.icon}
                      <Text>{item.type}</Text>
                    </Group>
                  </Table.Cell>
                  <Table.Cell>
                    <ChakraLink asChild>
                      <Link to={`/knowledge/item/${item.id}`}>
                        {item.title ?? "-"}
                      </Link>
                    </ChakraLink>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={"surface"}>{item.statusText}</Badge>
                  </Table.Cell>
                  <Table.Cell>{moment(item.updatedAt).fromNow()}</Table.Cell>
                  <Table.Cell>
                    <IconButton size={"xs"} variant={"subtle"}>
                      <TbRefresh />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Outlet />
        </Stack>
      )}
    </Page>
  );
}
