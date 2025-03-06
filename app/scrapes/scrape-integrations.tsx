import { Input, Stack } from "@chakra-ui/react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/dashboard/settings";
import type { Route } from "./+types/scrape-integrations";
import type { Prisma } from "@prisma/client";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";

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
  const discordServerId = formData.get("discordServerId") as string;

  const update: Prisma.ScrapeUpdateInput = {};

  if (discordServerId) {
    update.discordServerId = discordServerId;
  }

  const scrape = await prisma.scrape.update({
    where: { id: params.id },
    data: update,
  });

  return { scrape };
}

export default function ScrapeIntegrations({
  loaderData,
}: Route.ComponentProps) {
  const discordServerIdFetcher = useFetcher();
  return (
    <Stack>
      <SettingsSection
        title="Discord Server Id"
        description="Integrate CrawlChat with your Discord server to bother answer the queries and also to learn from the conversations."
        fetcher={discordServerIdFetcher}
      >
        <Stack>
          <Input
            name="discordServerId"
            placeholder="Enter your Discord server ID"
            defaultValue={loaderData.scrape.discordServerId ?? ""}
          />
        </Stack>
      </SettingsSection>
    </Stack>
  );
}
