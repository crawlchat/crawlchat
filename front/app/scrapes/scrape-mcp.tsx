import { Code, DataList, Group, Input, Stack, Text } from "@chakra-ui/react";
import { useFetcher } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { SettingsSection } from "~/dashboard/settings";
import type { Route } from "./+types/scrape-mcp";
import { prisma } from "~/prisma";
import { ClipboardIconButton, ClipboardRoot } from "~/components/ui/clipboard";
import type { Prisma } from "libs/prisma";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  return { scrape };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const formData = await request.formData();

  const mcpToolName = formData.get("mcpToolName") as string | null;

  const update: Prisma.ScrapeUpdateInput = {};
  if (mcpToolName) {
    update.mcpToolName = mcpToolName;
  }

  const scrape = await prisma.scrape.update({
    where: { id: params.id, userId: user!.id },
    data: update,
  });

  return { scrape };
}

export default function ScrapeMcp({ loaderData }: Route.ComponentProps) {
  const toolNameFetcher = useFetcher();

  const name =
    loaderData.scrape.mcpToolName ??
    loaderData.scrape.title?.replaceAll(" ", "_") ??
    loaderData.scrape.url;
  const mcpCommand = `npx crawl-chat-mcp --id=${loaderData.scrape.id} --name=${name}`;

  return (
    <Stack gap={6}>
      <DataList.Root orientation={"horizontal"}>
        <DataList.Item>
          <DataList.ItemLabel>MCP Command</DataList.ItemLabel>
          <DataList.ItemValue>
            <Group>
              <Code>{mcpCommand}</Code>
              <ClipboardRoot value={mcpCommand}>
                <ClipboardIconButton />
              </ClipboardRoot>
            </Group>
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
      <SettingsSection
        title="Search tool name"
        description="MCP clients rely on this name to identify when to use this tool. Give it a descriptive name. Should be alphanumeric and _ only."
        fetcher={toolNameFetcher}
      >
        <Input
          name="mcpToolName"
          defaultValue={loaderData.scrape.mcpToolName ?? ""}
          placeholder="Ex: search_mytool_documentation"
          pattern="^[a-zA-Z0-9_]+$"
        />
      </SettingsSection>
    </Stack>
  );
}
