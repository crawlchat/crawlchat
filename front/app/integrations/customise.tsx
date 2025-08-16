import { Group, HStack, Input, parseColor, Stack } from "@chakra-ui/react";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import {
  SettingsContainer,
  SettingsSection,
  SettingsSectionProvider,
} from "~/settings-section";
import { useFetcher } from "react-router";
import type { WidgetConfig, WidgetSize } from "libs/prisma";
import { useEffect, useMemo, useRef } from "react";
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

function makeScriptCode(scrapeId: string) {
  if (typeof window === "undefined") {
    return { script: "", docusaurusConfig: "" };
  }

  const origin = window.location.origin;

  const script = `<script 
  src="${origin}/embed.js" 
  id="crawlchat-script" 
  data-id="${scrapeId}"
></script>`;

  const docusaurusConfig = `headTags: [
  {
      "tagName": "script",
      "attributes": {
        "src": "${origin}/embed.js",
        "id": "crawlchat-script",
        "data-id": "${scrapeId}"
      },
    },
],`;

  return { script, docusaurusConfig };
}

function PreviewEmbed({ scriptCode }: { scriptCode: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;

    iframeRef.current.contentDocument.open();
    iframeRef.current.contentDocument.close();

    iframeRef.current.contentDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CrawlChat</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
            }
          </style>
        </head>
        <body>
          ${scriptCode}
        </body>
      </html>`);
  }, [scriptCode]);

  return (
    <iframe ref={iframeRef} id="crawlchat-script" style={{ height: "100%" }} />
  );
}

export default function ScrapeCustomise({ loaderData }: Route.ComponentProps) {
  const widgetConfigFetcher = useFetcher();
  const scriptCode = useMemo(
    () => makeScriptCode(loaderData.scrape?.id ?? ""),
    [loaderData.scrape?.id]
  );

  return (
    <SettingsSectionProvider>
      <SettingsContainer>
        <SettingsSection
          id="customise-widget"
          title="Customise widget"
          description="Configure the widget and copy paste the <script> tag below to your website."
          fetcher={widgetConfigFetcher}
        >
          <input type="hidden" name="from-widget" value={"true"} />
          <Group alignItems={"flex-start"} gap={10}>
            <Stack flex={1}>
              <Stack gap={6}>
                <Group>
                  <ColorPickerRoot
                    flex={1}
                    name="primaryColor"
                    defaultValue={
                      loaderData.scrape?.widgetConfig?.primaryColor
                        ? parseColor(
                            loaderData.scrape.widgetConfig.primaryColor
                          )
                        : undefined
                    }
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
                    defaultValue={
                      loaderData.scrape?.widgetConfig?.buttonTextColor
                        ? parseColor(
                            loaderData.scrape.widgetConfig.buttonTextColor
                          )
                        : undefined
                    }
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
                      defaultValue={
                        loaderData.scrape?.widgetConfig?.buttonText ?? ""
                      }
                    />
                  </Field>
                </Group>

                <Group>
                  <Field label="Tooltip">
                    <Input
                      placeholder="Ex: Ask AI or reach out to us!"
                      name="tooltip"
                      defaultValue={
                        loaderData.scrape?.widgetConfig?.tooltip ?? ""
                      }
                    />
                  </Field>
                </Group>

                <Group>
                  <Switch
                    name="showLogo"
                    defaultChecked={
                      loaderData.scrape?.widgetConfig?.showLogo ?? false
                    }
                  >
                    Show logo
                  </Switch>
                </Group>
              </Stack>
            </Stack>

            <Stack flex={1}>
              <Stack
                flex={1}
                bg="brand.outline-subtle"
                p={2}
                rounded={"md"}
                overflow={"hidden"}
                alignSelf={"stretch"}
              >
                <PreviewEmbed
                  key={widgetConfigFetcher.state}
                  scriptCode={scriptCode.script}
                />
              </Stack>
            </Stack>
          </Group>
        </SettingsSection>
      </SettingsContainer>
    </SettingsSectionProvider>
  );
}
