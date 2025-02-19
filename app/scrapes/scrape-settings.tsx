import { Stack, Text, Textarea } from "@chakra-ui/react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/dashboard/settings";
import { prisma } from "~/prisma";
import type { Route } from "./+types/scrape-settings";
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

export default function ScrapeSettings({ loaderData }: Route.ComponentProps) {
  const promptFetcher = useFetcher();

  return (
    <Stack>
      <SettingsSection
        title="Chat Prompt"
        description="Customize the chat prompt for this scrape."
        fetcher={promptFetcher}
      >
        <input type="hidden" name="scrapeId" value={loaderData.scrape.id} />
        <Textarea
          name="chatPrompt"
          defaultValue={loaderData.scrape.chatPrompt ?? ""}
          placeholder="Enter a custom chat prompt for this scrape."
        />
      </SettingsSection>
    </Stack>
  );
}
