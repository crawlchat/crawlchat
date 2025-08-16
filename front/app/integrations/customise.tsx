import { Group, HStack, Input, parseColor, Stack } from "@chakra-ui/react";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { SettingsSection } from "~/settings-section";
import { useFetcher } from "react-router";
import type { Scrape, WidgetConfig, WidgetSize } from "libs/prisma";
import {
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerRoot,
  ColorPickerSliders,
  ColorPickerTrigger,
} from "~/components/ui/color-picker";
import { Field } from "~/components/ui/field";
import type { Route } from "./+types/embed";
import { authoriseScrapeUser, getSessionScrapeId } from "../scrapes/util";
import { Switch } from "~/components/ui/switch";
import { AskAIButton } from "~/widget/ask-ai-button";
import { useMemo, useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
    },
  });

  return { scrape };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
    },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const formData = await request.formData();
  const size = formData.get("size");
  const questions = formData.getAll("questions");
  const welcomeMessage = formData.get("welcomeMessage");

  const update: WidgetConfig = scrape.widgetConfig ?? {
    size: "small",
    questions: [],
    welcomeMessage: null,
    showMcpSetup: null,
    textInputPlaceholder: null,
    primaryColor: null,
    buttonText: null,
    buttonTextColor: null,
    showLogo: null,
    tooltip: null,
    private: false,
  };

  if (size) {
    update.size = size as WidgetSize;
  }
  if (formData.has("from-questions")) {
    update.questions = questions.map((text) => ({ text: text as string }));
  }
  if (welcomeMessage !== null && welcomeMessage !== undefined) {
    update.welcomeMessage = welcomeMessage as string;
  }
  if (formData.has("from-mcp-setup")) {
    update.showMcpSetup = formData.get("showMcpSetup") === "on";
  }
  if (formData.has("textInputPlaceholder")) {
    update.textInputPlaceholder = formData.get(
      "textInputPlaceholder"
    ) as string;
  }
  if (formData.has("primaryColor")) {
    update.primaryColor = formData.get("primaryColor") as string;
  }
  if (formData.has("buttonText")) {
    update.buttonText = formData.get("buttonText") as string;
  }
  if (formData.has("buttonTextColor")) {
    update.buttonTextColor = formData.get("buttonTextColor") as string;
  }
  if (formData.has("from-widget")) {
    update.showLogo = formData.get("showLogo") === "on";
  }
  if (formData.has("tooltip")) {
    update.tooltip = formData.get("tooltip") as string;
  }
  if (formData.has("from-private")) {
    update.private = formData.get("private") === "on";
  }

  await prisma.scrape.update({
    where: {
      id: scrape.id,
    },
    data: {
      widgetConfig: update,
    },
  });

  return null;
}

export default function ScrapeCustomise({ loaderData }: Route.ComponentProps) {
  const widgetConfigFetcher = useFetcher();
  const [primaryColor, setPrimaryColor] = useState(
    loaderData.scrape?.widgetConfig?.primaryColor
  );
  const [buttonTextColor, setButtonTextColor] = useState(
    loaderData.scrape?.widgetConfig?.buttonTextColor
  );
  const [buttonText, setButtonText] = useState(
    loaderData.scrape?.widgetConfig?.buttonText
  );
  const [tooltip, setTooltip] = useState(
    loaderData.scrape?.widgetConfig?.tooltip
  );
  const [showLogo, setShowLogo] = useState(
    loaderData.scrape?.widgetConfig?.showLogo ?? false
  );
  const liveScrape = useMemo(() => {
    return {
      ...loaderData.scrape!,
      widgetConfig: {
        ...loaderData.scrape?.widgetConfig,
        primaryColor,
        buttonTextColor,
        buttonText,
        tooltip,
        showLogo,
      },
    };
  }, [
    loaderData.scrape,
    primaryColor,
    buttonTextColor,
    buttonText,
    tooltip,
    showLogo,
  ]);

  return (
    <Group alignItems={"flex-start"} gap={4}>
      <SettingsSection
        id="customise-widget"
        title="Customise widget"
        description="Configure the widget and copy paste the <script> tag below to your website."
        fetcher={widgetConfigFetcher}
      >
        <input type="hidden" name="from-widget" value={"true"} />

        <Stack flex={1}>
          <Stack gap={6}>
            <Group>
              <ColorPickerRoot
                flex={1}
                name="primaryColor"
                value={primaryColor ? parseColor(primaryColor) : undefined}
                onValueChange={(e) => setPrimaryColor(e.valueAsString)}
              >
                <ColorPickerLabel>Button color</ColorPickerLabel>
                <ColorPickerControl>
                  <ColorPickerInput />
                  <ColorPickerTrigger />
                </ColorPickerControl>
                <ColorPickerContent>
                  <ColorPickerArea />
                  <HStack>
                    <ColorPickerEyeDropper />
                    <ColorPickerSliders />
                  </HStack>
                </ColorPickerContent>
              </ColorPickerRoot>

              <ColorPickerRoot
                flex={1}
                name="buttonTextColor"
                value={
                  buttonTextColor ? parseColor(buttonTextColor) : undefined
                }
                onValueChange={(e) => setButtonTextColor(e.valueAsString)}
              >
                <ColorPickerLabel>Button text color</ColorPickerLabel>
                <ColorPickerControl>
                  <ColorPickerInput />
                  <ColorPickerTrigger />
                </ColorPickerControl>
                <ColorPickerContent>
                  <ColorPickerArea />
                  <HStack>
                    <ColorPickerEyeDropper />
                    <ColorPickerSliders />
                  </HStack>
                </ColorPickerContent>
              </ColorPickerRoot>
            </Group>

            <Group>
              <Field label="Button text">
                <Input
                  placeholder="Button text"
                  name="buttonText"
                  value={buttonText ?? ""}
                  onChange={(e) => setButtonText(e.target.value)}
                />
              </Field>
            </Group>

            <Group>
              <Field label="Tooltip">
                <Input
                  placeholder="Ex: Ask AI or reach out to us!"
                  name="tooltip"
                  value={tooltip ?? ""}
                  onChange={(e) => setTooltip(e.target.value)}
                />
              </Field>
            </Group>

            <Group>
              <Switch
                name="showLogo"
                checked={showLogo}
                onCheckedChange={(e) => setShowLogo(e.checked)}
              >
                Show logo
              </Switch>
            </Group>
          </Stack>
        </Stack>
      </SettingsSection>
      <Stack>
        <AskAIButton scrape={liveScrape as Scrape} />
      </Stack>
    </Group>
  );
}
