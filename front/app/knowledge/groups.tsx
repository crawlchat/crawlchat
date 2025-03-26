import {
  Badge,
  Group,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
  Center,
  IconButton,
  DialogTitle,
} from "@chakra-ui/react";
import type { Route } from "./+types/groups";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import {
  TbBook,
  TbBrandDiscord,
  TbBrandGithub,
  TbCheck,
  TbLoader,
  TbPlayerPauseFilled,
  TbPlus,
  TbRefresh,
  TbTrash,
  TbWorld,
  TbX,
} from "react-icons/tb";
import { Link, redirect, useFetcher } from "react-router";
import { getSessionScrapeId } from "~/scrapes/util";
import { Page } from "~/components/page";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { useEffect, useMemo, useState } from "react";
import type { KnowledgeGroup } from "libs/prisma";
import { createToken } from "~/jwt";
import { toaster } from "~/components/ui/toaster";
import {
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "~/components/ui/dialog";

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

  if (intent === "delete") {
    const knowledgeGroupId = formData.get("knowledgeGroupId") as string;

    if (!knowledgeGroupId) {
      return { error: "Knowledge group ID is required" };
    }

    const token = createToken(user!.id);
    await fetch(`${process.env.VITE_SERVER_URL}/knowledge-group`, {
      method: "DELETE",
      body: JSON.stringify({
        knowledgeGroupId,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    throw redirect(`/knowledge`);
  }
}

function RefreshButton({
  knowledgeGroupId,
  disabled,
}: {
  knowledgeGroupId: string;
  disabled: boolean;
}) {
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
        disabled={fetcher.state !== "idle" || disabled}
      >
        <TbRefresh />
      </IconButton>
    </fetcher.Form>
  );
}

export default function KnowledgeGroups({ loaderData }: Route.ComponentProps) {
  const deleteFetcher = useFetcher();
  const [deleteGroup, setDeleteGroup] = useState<KnowledgeGroup>();

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
      } else if (group.type === "learn_discord") {
        icon = <TbBrandDiscord />;
        typeText = "Discord";
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
        statusText,
        statusColor,
        statusIcon,
        typeText,
        group,
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
            <Link to="/knowledge/group">
              <TbPlus />
              Add group
            </Link>
          </Button>
        </Group>
      }
    >
      {groups.length === 0 && (
        <Center w="full" h="full">
          <EmptyState
            title="No knowledge groups"
            description="Create a new knowledge group to get started."
          >
            <Button asChild colorPalette={"brand"}>
              <Link to="/knowledge/group">
                <TbPlus />
                Create a group
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
                <Table.ColumnHeader w="12%">Type</Table.ColumnHeader>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader w="10%"># Items</Table.ColumnHeader>
                <Table.ColumnHeader w="10%">Status</Table.ColumnHeader>
                <Table.ColumnHeader w="20%">Updated</Table.ColumnHeader>
                <Table.ColumnHeader w="10%">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.map((item) => (
                <Table.Row key={item.group.id}>
                  <Table.Cell className="group">
                    <Group>
                      <Text fontSize={"xl"}>{item.icon}</Text>
                      <Text>{item.typeText}</Text>
                    </Group>
                  </Table.Cell>
                  <Table.Cell>
                    <ChakraLink
                      asChild
                      variant={"underline"}
                      _hover={{
                        color: "brand.fg",
                      }}
                    >
                      <Link to={`/knowledge/group/${item.group.id}`}>
                        {item.group.title ?? "Untitled"}
                      </Link>
                    </ChakraLink>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={"subtle"}>
                      {loaderData.counts[item.group.id] ?? 0}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={"surface"} colorPalette={item.statusColor}>
                      {item.statusIcon}
                      {item.statusText}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {moment(item.group.updatedAt).fromNow()}
                  </Table.Cell>
                  <Table.Cell>
                    <Group>
                      {["scrape_web", "scrape_github"].includes(
                        item.group.type
                      ) && (
                        <RefreshButton
                          knowledgeGroupId={item.group.id}
                          disabled={
                            !["pending", "error", "done"].includes(
                              item.group.status
                            )
                          }
                        />
                      )}

                      <IconButton
                        size={"xs"}
                        variant={"subtle"}
                        colorPalette={"red"}
                        onClick={() => setDeleteGroup(item.group)}
                        disabled={
                          !["pending", "error", "done"].includes(
                            item.group.status
                          )
                        }
                      >
                        <TbTrash />
                      </IconButton>
                    </Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <DialogRoot
            open={deleteGroup !== undefined}
            onOpenChange={(e) => setDeleteGroup(e.open ? undefined : undefined)}
          >
            <DialogBackdrop />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete knowledge group</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Stack>
                  <Text>
                    Are you sure you want to delete{" "}
                    <Text as="span" fontWeight={"bold"}>
                      {deleteGroup?.title ?? "Untitled"}
                    </Text>{" "}
                    knowledge group? All the associated data will be deleted.
                    This action cannot be undone.
                  </Text>
                </Stack>
              </DialogBody>
              <DialogFooter>
                <deleteFetcher.Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <input
                    type="hidden"
                    name="knowledgeGroupId"
                    value={deleteGroup?.id}
                  />
                  <Button
                    colorPalette={"red"}
                    type="submit"
                    loading={deleteFetcher.state !== "idle"}
                  >
                    Delete
                    <TbTrash />
                  </Button>
                </deleteFetcher.Form>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        </Stack>
      )}
    </Page>
  );
}
