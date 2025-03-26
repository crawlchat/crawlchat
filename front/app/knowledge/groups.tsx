import {
  Badge,
  Group,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
  Center,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import type { Route } from "./+types/groups";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import {
  TbBook,
  TbBrandGithub,
  TbCheck,
  TbLoader,
  TbPlayerPause,
  TbPlayerPauseFilled,
  TbPlayerPlay,
  TbPlayerPlayFilled,
  TbPlus,
  TbRefresh,
  TbWorld,
  TbX,
} from "react-icons/tb";
import { Link, Outlet, useFetcher } from "react-router";
import { getSessionScrapeId } from "~/scrapes/util";
import { Page } from "~/components/page";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { useEffect, useMemo } from "react";
import type { KnowledgeGroup } from "libs/prisma";
import { createToken } from "~/jwt";
import { toaster } from "~/components/ui/toaster";

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

  const counts: Record<string, number> = {};
  for (const group of knowledgeGroups) {
    counts[group.id] = await prisma.scrapeItem.count({
      where: { knowledgeGroupId: group.id },
    });
  }

  return { scrape, knowledgeGroups, counts };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "refresh") {
    const knowledgeGroupId = formData.get("knowledgeGroupId") as string;

    if (!knowledgeGroupId) {
      return { error: "Knowledge group ID is required" };
    }

    const token = createToken(user!.id);
    await fetch(`${process.env.VITE_SERVER_URL}/scrape`, {
      method: "POST",
      body: JSON.stringify({
        scrapeId,
        knowledgeGroupId,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroupId, userId: user!.id },
      data: { status: "processing" },
    });

    return { success: true };
  }
}

function RefreshButton({ knowledgeGroupId }: { knowledgeGroupId: string }) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success) {
      toaster.success({
        title: "Group refresh initiated!",
        description: "This may take a while.",
      });
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="refresh" />
      <input type="hidden" name="knowledgeGroupId" value={knowledgeGroupId} />
      <IconButton
        size={"xs"}
        variant={"subtle"}
        type="submit"
        disabled={fetcher.state !== "idle"}
      >
        <TbRefresh />
      </IconButton>
    </fetcher.Form>
  );
}

export default function KnowledgeGroups({ loaderData }: Route.ComponentProps) {
  const groups = useMemo(() => {
    return loaderData.knowledgeGroups.map((group) => {
      let icon = <TbBook />;
      let statusText = "Unknown";
      let statusColor: string | undefined = undefined;
      let statusIcon = <TbBook />;
      let typeText = "Unknown";

      if (group.type === "scrape_web") {
        icon = <TbWorld />;
        typeText = "Web";
      } else if (group.type === "scrape_github") {
        icon = <TbBrandGithub />;
        typeText = "GitHub";
      }

      if (group.status === "pending") {
        statusText = "To be processed";
        statusIcon = <TbPlayerPauseFilled />;
      } else if (group.status === "done") {
        statusText = "Up to date";
        statusColor = "brand";
        statusIcon = <TbCheck />;
      } else if (group.status === "error") {
        statusText = "Error";
        statusColor = "red";
        statusIcon = <TbX />;
      } else if (group.status === "processing") {
        statusText = "Updating";
        statusColor = "blue";
        statusIcon = <TbLoader />;
      }

      return {
        icon,
        title: group.title,
        statusText,
        type: group.type,
        updatedAt: group.updatedAt,
        id: group.id,
        statusColor,
        statusIcon,
        status: group.status,
        typeText,
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
                <Table.ColumnHeader w="16%">Type</Table.ColumnHeader>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader w="6%"># Items</Table.ColumnHeader>
                <Table.ColumnHeader w="10%">Status</Table.ColumnHeader>
                <Table.ColumnHeader w="16%">Updated</Table.ColumnHeader>
                <Table.ColumnHeader w="10%">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell className="group">
                    <Group>
                      <Text fontSize={"xl"}>{item.icon}</Text>
                      <Text>{item.typeText}</Text>
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
                    <Badge variant={"subtle"} colorPalette={item.statusColor}>
                      {loaderData.counts[item.id] ?? 0}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={"surface"} colorPalette={item.statusColor}>
                      {item.statusIcon}
                      {item.statusText}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{moment(item.updatedAt).fromNow()}</Table.Cell>
                  <Table.Cell>
                    {["pending", "error", "done"].includes(item.status) && (
                      <RefreshButton knowledgeGroupId={item.id} />
                    )}
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
