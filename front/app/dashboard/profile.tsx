import { Page } from "~/components/page";
import { TbSettings } from "react-icons/tb";
import { Input, Stack } from "@chakra-ui/react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/profile";
import { getAuthUser } from "~/auth/middleware";
import type { Prisma } from "libs/prisma";
import { prisma } from "~/prisma";
import { Switch } from "~/components/ui/switch";
import {
  SettingsContainer,
  SettingsSection,
  SettingsSectionProvider,
} from "~/settings-section";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  return { user: user! };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const formData = await request.formData();

  const update: Prisma.UserUpdateInput = {
    settings: user?.settings ?? {
      weeklyUpdates: true,
      ticketEmailUpdates: true,
    },
  };

  if (formData.has("from-weekly-updates")) {
    update.settings!.weeklyUpdates = formData.get("weeklyUpdates") === "on";
  }
  if (formData.has("from-ticket-updates")) {
    update.settings!.ticketEmailUpdates =
      formData.get("ticketUpdates") === "on";
  }
  if (formData.has("name")) {
    update.name = formData.get("name") as string;
  }

  await prisma.user.update({
    where: { id: user!.id },
    data: update,
  });

  return Response.json({ success: true });
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const weeklyUpdatesFetcher = useFetcher();
  const ticketUpdatesFetcher = useFetcher();
  const nameFetcher = useFetcher();

  return (
    <Page title="Profile" icon={<TbSettings />}>
      <Stack w="full">
        <SettingsSectionProvider>
          <SettingsContainer>
            <SettingsSection
              id="name"
              fetcher={nameFetcher}
              title="Name"
              description="Set your name to be displayed in the dashboard"
            >
              <Stack>
                <Input
                  name="name"
                  defaultValue={loaderData.user.name ?? ""}
                  placeholder="Your name"
                  maxW={400}
                />
              </Stack>
            </SettingsSection>

            <SettingsSection
              id="weekly-updates"
              fetcher={weeklyUpdatesFetcher}
              title="Weekly Updates"
              description="Enable weekly updates to be sent to your email."
            >
              <Stack>
                <input type="hidden" name="from-weekly-updates" value="true" />
                <Switch
                  name="weeklyUpdates"
                  defaultChecked={
                    loaderData.user.settings?.weeklyUpdates ?? true
                  }
                >
                  Receive weekly email summary
                </Switch>
              </Stack>
            </SettingsSection>

            <SettingsSection
              id="ticket-updates"
              fetcher={ticketUpdatesFetcher}
              title="Ticket Updates"
              description="Enable ticket updates to be sent to your email."
            >
              <Stack>
                <input type="hidden" name="from-ticket-updates" value="true" />
                <Switch
                  name="ticketUpdates"
                  defaultChecked={
                    loaderData.user.settings?.ticketEmailUpdates ?? true
                  }
                >
                  Receive ticket updates
                </Switch>
              </Stack>
            </SettingsSection>
          </SettingsContainer>
        </SettingsSectionProvider>
      </Stack>
    </Page>
  );
}
