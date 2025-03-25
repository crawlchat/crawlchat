import {
  Badge,
  DataList,
  Group,
  IconButton,
  Input,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Link, redirect, useFetcher } from "react-router";
import { SettingsSection } from "~/dashboard/profile";
import { prisma } from "~/prisma";
import type { Route } from "./+types/settings";
import { getAuthUser } from "~/auth/middleware";
import type { Prisma } from "libs/prisma";
import { getSession } from "~/session";
import {
  TbAlertCircle,
  TbCheck,
  TbLink,
  TbRefresh,
  TbSettings,
  TbTrash,
  TbWorld,
} from "react-icons/tb";
import { Page } from "~/components/page";
import moment from "moment";
import { Tooltip } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { toaster } from "~/components/ui/toaster";
import { useEffect, useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");

  if (!scrapeId) {
    throw redirect("/app");
  }

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const itemsCount = await prisma.scrapeItem.count({
    where: { scrapeId: scrape.id },
  });

  return { scrape, itemsCount };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const formData = await request.formData();

  const chatPrompt = formData.get("chatPrompt") as string | null;
  const title = formData.get("title") as string | null;

  const update: Prisma.ScrapeUpdateInput = {};
  if (chatPrompt) {
    update.chatPrompt = chatPrompt;
  }
  if (title) {
    update.title = title;
  }

  const scrape = await prisma.scrape.update({
    where: { id: params.id, userId: user!.id },
    data: update,
  });

  return { scrape };
}

export default function ScrapeSettings({ loaderData }: Route.ComponentProps) {
  const promptFetcher = useFetcher();
  const nameFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (deleteConfirm) {
      setTimeout(() => {
        setDeleteConfirm(false);
      }, 5000);
    }
  }, [deleteConfirm]);

  function copyUrl() {
    const url = new URL(window.location.origin);
    url.pathname = `/w/${loaderData.scrape.id}`;
    navigator.clipboard.writeText(url.toString());
    toaster.success({
      title: "Copied to clipboard",
      description: "URL copied to clipboard",
    });
  }

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    deleteFetcher.submit(null, {
      method: "delete",
    });
  }

  return (
    <Page
      title="Settings"
      icon={<TbSettings />}
      right={
        <Group>
          <Tooltip
            content={deleteConfirm ? "Sure to delete?" : "Delete"}
            showArrow
            open={deleteConfirm}
          >
            <IconButton
              colorPalette={"red"}
              variant={deleteConfirm ? "solid" : "subtle"}
              onClick={handleDelete}
              disabled={deleteFetcher.state !== "idle"}
            >
              {deleteFetcher.state !== "idle" ? (
                <Spinner size="sm" />
              ) : (
                <TbTrash />
              )}
            </IconButton>
          </Tooltip>
          <IconButton variant={"subtle"} onClick={copyUrl}>
            <TbLink />
          </IconButton>

          <Button variant={"subtle"} asChild>
            <Link
              to={`/scrape?url=${loaderData.scrape.url}&collection=${loaderData.scrape.id}&links=300`}
            >
              <TbRefresh />
              Re-crawl
            </Link>
          </Button>
        </Group>
      }
    >
      <Stack gap={4}>
        <DataList.Root orientation={"horizontal"}>
          <DataList.Item>
            <DataList.ItemLabel>Links scraped</DataList.ItemLabel>
            <DataList.ItemValue>
              <Badge variant={"surface"} colorPalette={"brand"}>
                <TbWorld />
                {loaderData.itemsCount}
              </Badge>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Status</DataList.ItemLabel>
            <DataList.ItemValue>
              {loaderData.scrape.status === "done" && (
                <Badge colorPalette={"brand"} variant={"surface"}>
                  <TbCheck />
                  Completed
                </Badge>
              )}
              {loaderData.scrape.status === "scraping" && (
                <Badge variant={"surface"}>
                  <Spinner size={"xs"} />
                  Scraping
                </Badge>
              )}
              {loaderData.scrape.status === "error" && (
                <Badge variant={"surface"} colorPalette={"red"}>
                  <TbAlertCircle />
                  Error
                </Badge>
              )}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Created</DataList.ItemLabel>
            <DataList.ItemValue>
              {moment(loaderData.scrape.createdAt).fromNow()}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Root URL</DataList.ItemLabel>
            <DataList.ItemValue>
              {loaderData.scrape.url || "-"}
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>

        <SettingsSection
          title="Name"
          description="Give it a name. It will be shown on chat screen."
          fetcher={nameFetcher}
        >
          <Input
            name="title"
            defaultValue={loaderData.scrape.title ?? ""}
            placeholder="Enter a name for this scrape."
          />
        </SettingsSection>
        <SettingsSection
          title="Chat Prompt"
          description="Customize the chat prompt for this scrape."
          fetcher={promptFetcher}
        >
          <Textarea
            name="chatPrompt"
            defaultValue={loaderData.scrape.chatPrompt ?? ""}
            placeholder="Enter a custom chat prompt for this scrape."
          />
        </SettingsSection>
      </Stack>
    </Page>
  );
}
