import {
  Badge,
  Dialog,
  IconButton,
  Input,
  Portal,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import {
  TbCheck,
  TbCrown,
  TbPlus,
  TbShield,
  TbTrash,
  TbUser,
  TbUsers,
} from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/page";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { prisma } from "libs/prisma";
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { toaster } from "~/components/ui/toaster";
import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  const scrapeUser = authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrapeUsers = await prisma.scrapeUser.findMany({
    where: {
      scrapeId,
    },
    include: {
      user: true,
    },
  });

  return { user, scrapeUsers, scrapeUser };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "invite") {
    const email = formData.get("email");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email as string,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 400 });
    }

    await prisma.scrapeUser.create({
      data: {
        scrapeId,
        userId: user.id,
        role: "member",
        email: user.email,
      },
    });

    return Response.json({ success: true });
  }
}

function RoleBadge({ role }: { role: string }) {
  if (role === "owner") {
    return (
      <Badge variant={"subtle"} colorPalette={"brand"}>
        <TbCrown />
        OWNER
      </Badge>
    );
  }
  if (role === "admin") {
    return (
      <Badge variant={"subtle"} colorPalette={"brand"}>
        <TbShield />
        ADMIN
      </Badge>
    );
  }
  return (
    <Badge variant={"subtle"}>
      <TbUser />
      {role.toUpperCase()}
    </Badge>
  );
}

function Invite() {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data?.error) {
      toaster.error({
        title: "Error",
        description: fetcher.data.error,
      });
    } else {
      setOpen(false);
      toaster.success({
        title: "Success",
        description: "Invited the user",
      });
    }
  }, [fetcher.data]);

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
      <Dialog.Trigger asChild>
        <Button variant={"subtle"}>
          Invite
          <TbPlus />
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="invite" />
              <Dialog.Header>
                <Dialog.Title>Invite team member</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <p>
                    Give your team members email. They will be notified via
                    email if they have not signed up yet.
                  </p>
                  <Input
                    placeholder="team-member@example.com"
                    name="email"
                    required
                  />
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger
                  asChild
                  disabled={fetcher.state !== "idle"}
                >
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" loading={fetcher.state !== "idle"}>
                  Invite
                  <TbCheck />
                </Button>
              </Dialog.Footer>
            </fetcher.Form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default function TeamPage({ loaderData }: Route.ComponentProps) {
  const canDeleteUser = ["owner", "admin"].includes(loaderData.scrapeUser.role);

  return (
    <Page title="Team" icon={<TbUsers />} right={<Invite />}>
      <Stack gap={4}>
        <Text opacity={0.5}>
          Invite your team members and manage their access.
        </Text>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Date added
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loaderData.scrapeUsers.map((scrapeUser) => (
              <Table.Row key={scrapeUser.id}>
                <Table.Cell>{scrapeUser.email}</Table.Cell>
                <Table.Cell>
                  <RoleBadge role={scrapeUser.role} />
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {scrapeUser.createdAt.toLocaleDateString()}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {scrapeUser.role !== "admin" && (
                    <IconButton
                      variant={"subtle"}
                      size={"sm"}
                      disabled={!canDeleteUser}
                    >
                      <TbTrash />
                    </IconButton>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Stack>
    </Page>
  );
}
