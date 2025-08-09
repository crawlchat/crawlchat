import { TbPlus, TbPointer } from "react-icons/tb";
import { Link, NavLink, Outlet } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { Page } from "~/components/page";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/layout";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { prisma } from "libs/prisma";
import {
  Table,
  Link as ChakraLink,
  Group,
  Text,
  Spinner,
  EmptyState,
  VStack,
  Center,
  Stack,
  Badge,
} from "@chakra-ui/react";
import moment from "moment";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const actions = await prisma.apiAction.findMany({
    where: {
      scrapeId,
    },
  });

  const counts: Record<string, number> = {};
  for (const action of actions) {
    const count = await prisma.message.count({
      where: {
        scrapeId,
        apiActionCalls: {
          some: {
            actionId: action.id,
          },
        },
      },
    });
    counts[action.id] = count;
  }

  return { actions, counts };
}

function Summary() {
  return (
    <Text>
      Actions let you connect to external systems with HTTP APIs. These actions
      will get called by AI and chatbot whenever required. These APIs are called
      from backend in a secured way.
    </Text>
  );
}

function NoActions() {
  return (
    <Center h="full" w="full">
      <EmptyState.Root maxW={"md"}>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <TbPointer />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No actions yet</EmptyState.Title>
            <EmptyState.Description>
              <Summary />
            </EmptyState.Description>
            <Button asChild colorPalette={"brand"}>
              <NavLink to="/actions/new" prefetch="intent">
                <TbPlus />
                New action
              </NavLink>
            </Button>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    </Center>
  );
}

export default function ActionsLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Page
      title="Actions"
      icon={<TbPointer />}
      right={
        <Button asChild variant={"subtle"} colorPalette={"brand"}>
          <NavLink to="/actions/new">
            <TbPlus />
            New
          </NavLink>
        </Button>
      }
    >
      {loaderData.actions.length === 0 && <NoActions />}
      {loaderData.actions.length > 0 && (
        <Stack>
          <Stack opacity={0.5}>
            <Summary />
          </Stack>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader>URL</Table.ColumnHeader>
                <Table.ColumnHeader>Method</Table.ColumnHeader>
                <Table.ColumnHeader>Calls</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Created</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loaderData.actions.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <ChakraLink asChild outline={"none"}>
                      <NavLink to={`/actions/${item.id}`} prefetch="intent">
                        {({ isPending }) => (
                          <Group>
                            <Text>{item.title}</Text>
                            <Spinner opacity={isPending ? 1 : 0} size={"sm"} />
                          </Group>
                        )}
                      </NavLink>
                    </ChakraLink>
                  </Table.Cell>
                  <Table.Cell>{item.url}</Table.Cell>
                  <Table.Cell>{item.method.toUpperCase()}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={"brand"} variant={"surface"}>
                      {loaderData.counts[item.id]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    {moment(item.createdAt).fromNow()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Stack>
      )}

      <Outlet />
    </Page>
  );
}
