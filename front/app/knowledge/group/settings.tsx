import type { Prisma } from "libs/prisma";
import { prisma, type KnowledgeGroup } from "libs/prisma";
import { getAuthUser } from "~/auth/middleware";
import { getSessionScrapeId } from "~/scrapes/util";
import type { Route } from "./+types/settings";
import { DataList, Group, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { SettingsSection } from "~/dashboard/profile";
import { useEffect, useMemo, useState } from "react";
import { redirect, useFetcher } from "react-router";
import { Switch } from "~/components/ui/switch";
import moment from "moment";
import { GroupStatus } from "./status";
import { Button } from "~/components/ui/button";
import { TbTrash } from "react-icons/tb";
import { createToken } from "~/jwt";

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

  return { scrape, knowledgeGroup };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);
  const groupId = params.groupId;

  if (request.method === "DELETE") {
    const token = createToken(user!.id);
    await fetch(`${process.env.VITE_SERVER_URL}/knowledge-group`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        knowledgeGroupId: groupId,
      }),
    });

    return redirect("/knowledge");
  }

  const formData = await request.formData();

  const update: Prisma.KnowledgeGroupUpdateInput = {};

  if (formData.has("from-match-prefix")) {
    update.matchPrefix = formData.get("matchPrefix") === "on";
  }
  if (formData.has("removeHtmlTags")) {
    update.removeHtmlTags = formData.get("removeHtmlTags") as string;
  }
  if (formData.has("skipPageRegex")) {
    update.skipPageRegex = formData.get("skipPageRegex") as string;
  }
  if (formData.has("githubBranch")) {
    update.githubBranch = formData.get("githubBranch") as string;
  }
  if (formData.has("scrollSelector")) {
    update.scrollSelector = formData.get("scrollSelector") as string;
  }

  const group = await prisma.knowledgeGroup.update({
    where: { id: groupId, userId: user!.id, scrapeId },
    data: update,
  });

  return group;
}

function WebSettings({ group }: { group: KnowledgeGroup }) {
  const matchPrefixFetcher = useFetcher();
  const htmlTagsToRemoveFetcher = useFetcher();
  const skipRegexFetcher = useFetcher();
  const scrollSelectorFetcher = useFetcher();
  const details = useMemo(() => {
    return [
      {
        key: "URL",
        value: group.url,
      },
      {
        key: "Updated at",
        value: moment(group.updatedAt).format("DD/MM/YYYY HH:mm"),
      },
      {
        key: "Status",
        value: <GroupStatus status={group.status} />,
      },
    ];
  }, [group]);

  return (
    <Stack gap={6}>
      <DataList.Root orientation={"horizontal"}>
        {details.map((item) => (
          <DataList.Item key={item.key}>
            <DataList.ItemLabel>{item.key}</DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList.Root>
      <SettingsSection
        fetcher={matchPrefixFetcher}
        title="Match prefix"
        description="If enabled, it scrapes only the pages whose prefix is the same as the group URL"
      >
        <input type="hidden" name="from-match-prefix" value={"true"} />
        <Switch name="matchPrefix" defaultChecked={group.matchPrefix ?? false}>
          Active
        </Switch>
      </SettingsSection>
      <SettingsSection
        fetcher={htmlTagsToRemoveFetcher}
        title="HTML tags to remove"
        description="You can specify the HTML selectors whose content is not added to the document. It is recommended to use this to remove junk content such as side menus, headers, footers, etc. You can give multiple selectors comma separated."
      >
        <Input
          placeholder="Ex: #sidebar, #header, #footer"
          maxW="400px"
          defaultValue={group.removeHtmlTags ?? ""}
          name="removeHtmlTags"
        />
      </SettingsSection>
      <SettingsSection
        fetcher={skipRegexFetcher}
        title="Skip pages regex"
        description="Specify the regex of the URLs that you don't want it to scrape. You can give multiple regexes comma separated."
      >
        <Input
          placeholder="Ex: /admin, /dashboard"
          maxW="400px"
          defaultValue={group.skipPageRegex ?? ""}
          name="skipPageRegex"
        />
      </SettingsSection>
      <SettingsSection
        fetcher={scrollSelectorFetcher}
        title="Scroll selector"
        description="Specify the selector of the element to scroll to. It is useful to scrape pages that have infinite scroll."
      >
        <Input
          placeholder="Ex: #panel"
          maxW="400px"
          defaultValue={group.scrollSelector ?? ""}
          name="scrollSelector"
        />
      </SettingsSection>
    </Stack>
  );
}

function GithubSettings({ group }: { group: KnowledgeGroup }) {
  const branchFetcher = useFetcher();
  const details = useMemo(() => {
    return [
      {
        key: "Repo",
        value: group.githubUrl,
      },
      {
        key: "Updated at",
        value: moment(group.updatedAt).format("DD/MM/YYYY HH:mm"),
      },
      {
        key: "Status",
        value: <GroupStatus status={group.status} />,
      },
    ];
  }, [group]);

  return (
    <Stack gap={6}>
      <DataList.Root orientation={"horizontal"}>
        {details.map((item) => (
          <DataList.Item key={item.key}>
            <DataList.ItemLabel>{item.key}</DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList.Root>
      <SettingsSection
        fetcher={branchFetcher}
        title="Branch"
        description="Specify the branch to scrape"
      >
        <Input
          placeholder="Ex: main"
          maxW="400px"
          defaultValue={group.githubBranch ?? ""}
          name="githubBranch"
        />
      </SettingsSection>
    </Stack>
  );
}

function GithubIssuesSettings({ group }: { group: KnowledgeGroup }) {
  const branchFetcher = useFetcher();
  const details = useMemo(() => {
    return [
      {
        key: "Repo",
        value: group.githubUrl,
      },
      {
        key: "Updated at",
        value: moment(group.updatedAt).format("DD/MM/YYYY HH:mm"),
      },
      {
        key: "Status",
        value: <GroupStatus status={group.status} />,
      },
    ];
  }, [group]);

  return (
    <Stack gap={6}>
      <DataList.Root orientation={"horizontal"}>
        {details.map((item) => (
          <DataList.Item key={item.key}>
            <DataList.ItemLabel>{item.key}</DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList.Root>
    </Stack>
  );
}

export default function KnowledgeGroupSettings({
  loaderData,
}: Route.ComponentProps) {
  const deleteFetcher = useFetcher();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (deleteConfirm) {
      setTimeout(() => {
        setDeleteConfirm(false);
      }, 5000);
    }
  }, [deleteConfirm]);

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
    <Stack gap={6}>
      {loaderData.knowledgeGroup.type === "scrape_web" && (
        <WebSettings group={loaderData.knowledgeGroup} />
      )}
      {loaderData.knowledgeGroup.type === "scrape_github" && (
        <GithubSettings group={loaderData.knowledgeGroup} />
      )}
      {loaderData.knowledgeGroup.type === "github_issues" && (
        <GithubIssuesSettings group={loaderData.knowledgeGroup} />
      )}

      <Stack
        border={"1px solid"}
        borderColor={"red.300"}
        bg={"brand.danger.subtle"}
        rounded={"lg"}
        p={4}
        gap={4}
      >
        <Stack>
          <Heading>Delete knowledge group</Heading>
          <Text fontSize={"sm"} opacity={0.5}>
            This will delete the knowledge group and all the data that is
            associated with it. This is not reversible.
          </Text>
        </Stack>
        <Group>
          <Button
            colorPalette={"red"}
            onClick={handleDelete}
            loading={deleteFetcher.state !== "idle"}
            variant={deleteConfirm ? "solid" : "outline"}
          >
            {deleteConfirm ? "Sure to delete?" : "Delete"}
            <TbTrash />
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
