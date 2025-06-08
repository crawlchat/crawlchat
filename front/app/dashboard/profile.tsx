import { Page } from "~/components/page";
import { TbCheck, TbSettings } from "react-icons/tb";
import { Group, Heading, Stack, Text } from "@chakra-ui/react";
import { useFetcher, type FetcherWithComponents } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/profile";
import { getAuthUser } from "~/auth/middleware";
import type { UserSettings } from "libs/prisma";
import { prisma } from "~/prisma";
import { Switch } from "~/components/ui/switch";
import { useEffect, useRef, useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  return { user: user! };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const formData = await request.formData();
  const intent = formData.get("intent");
  const openaiApiKey = formData.get("openaiApiKey");
  const weeklyUpdates = formData.get("weeklyUpdates");

  const update: Partial<UserSettings> = {};

  if (openaiApiKey !== null) {
    update.openaiApiKey = openaiApiKey as string;
  }
  if (intent === "weekly-updates") {
    update.weeklyUpdates = weeklyUpdates === "on";
  }

  await prisma.user.update({
    where: { id: user!.id },
    data: { settings: { ...user!.settings, ...update } },
  });

  return Response.json({ success: true });
}

export function SettingsSection({
  id,
  children,
  fetcher,
  title,
  description,
  actionRight,
}: {
  id?: string;
  children: React.ReactNode;
  fetcher?: FetcherWithComponents<unknown>;
  title?: React.ReactNode;
  description?: string;
  actionRight?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [targeted, setTargeted] = useState(false);
  
  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = url.hash;
    if (id && hash === `#${id}` && ref.current) {
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 70;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setTargeted(true);
    }
  }, [id]);

  function render() {
    return (
      <Stack
        border={"1px solid"}
        borderColor={"brand.outline"}
        borderRadius={"md"}
        overflow={"hidden"}
        ref={ref}
        outline={targeted ? "3px solid" : "none"}
        outlineColor={"brand.fg"}
        outlineOffset={"2px"}
      >
        <Stack p={4} gap={4}>
          <Stack>
            {title && <Heading size={"md"}>{title}</Heading>}
            {description && (
              <Text opacity={0.5} fontSize={"sm"}>
                {description}
              </Text>
            )}
          </Stack>
          {children}
        </Stack>
        <Group
          p={4}
          py={3}
          borderTop={"1px solid"}
          borderColor={"brand.outline"}
          bg="brand.gray.100"
          w="full"
          justifyContent={"space-between"}
        >
          <Group></Group>
          <Group>
            {actionRight}
            {fetcher && (
              <Button
                type="submit"
                size={"xs"}
                loading={fetcher.state !== "idle"}
              >
                Save
                <TbCheck />
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    );
  }

  if (!fetcher) {
    return render();
  }

  return <fetcher.Form method="post">{render()}</fetcher.Form>;
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const openaiApiKeyFetcher = useFetcher();

  return (
    <Page title="Profile" icon={<TbSettings />}>
      <Stack gap={8}>
        <SettingsSection
          fetcher={openaiApiKeyFetcher}
          title="Weekly Updates"
          description="Enable weekly updates to be sent to your email."
        >
          <Stack>
            <input type="hidden" name="intent" value="weekly-updates" />
            <Switch
              name="weeklyUpdates"
              defaultChecked={loaderData.user.settings?.weeklyUpdates ?? true}
            >
              Receive weekly email summary
            </Switch>
          </Stack>
        </SettingsSection>
      </Stack>
    </Page>
  );
}
