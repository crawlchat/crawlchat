import {
  Box,
  Button,
  Center,
  Group,
  HStack,
  IconButton,
  Input,
  parseColor,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { SettingsSection } from "~/settings-section";
import { useFetcher } from "react-router";
import type {
  Scrape,
  WidgetConfig,
  WidgetQuestion,
  WidgetSize,
} from "libs/prisma";
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
import { useEffect, useMemo, useState } from "react";
import { ChatBoxProvider } from "~/widget/use-chat-box";
import ChatBox, { ChatboxContainer } from "~/widget/chat-box";
import { TbPlus, TbTrash } from "react-icons/tb";

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
  const questionsFetcher = useFetcher();
  const welcomeMessageFetcher = useFetcher();
  const mcpSetupFetcher = useFetcher();
  const textInputPlaceholderFetcher = useFetcher();
  const [questions, setQuestions] = useState<WidgetQuestion[]>(
    loaderData.scrape?.widgetConfig?.questions ?? []
  );

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
  const [welcomeMessage, setWelcomeMessage] = useState(
    loaderData.scrape?.widgetConfig?.welcomeMessage
  );
  const [showMcpSetup, setShowMcpSetup] = useState(
    loaderData.scrape?.widgetConfig?.showMcpSetup ?? false
  );
  const [textInputPlaceholder, setTextInputPlaceholder] = useState(
    loaderData.scrape?.widgetConfig?.textInputPlaceholder
  );

  useEffect(() => {
    setQuestions(loaderData.scrape?.widgetConfig?.questions ?? []);
  }, [loaderData.scrape?.widgetConfig?.questions]);

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
        questions,
        welcomeMessage,
        showMcpSetup,
        textInputPlaceholder,
      },
    };
  }, [
    loaderData.scrape,
    primaryColor,
    buttonTextColor,
    buttonText,
    tooltip,
    showLogo,
    questions,
    welcomeMessage,
    showMcpSetup,
    textInputPlaceholder,
  ]);

  function addQuestion() {
    setQuestions([...questions, { text: "" }]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  return (
    <Group alignItems={"flex-start"} gap={4}>
      <Stack flex={2} gap={4}>
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

        <SettingsSection
          id="welcome-message"
          title="Welcome message"
          description="Add your custom welcome message to the widget. Supports markdown."
          fetcher={welcomeMessageFetcher}
        >
          <Textarea
            name="welcomeMessage"
            value={welcomeMessage ?? ""}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Hi, I'm the CrawlChat bot. How can I help you today?"
            rows={4}
          />
        </SettingsSection>

        <SettingsSection
          id="example-questions"
          title="Example questions"
          description="Show few example questions when a user visits the widget for the first time"
          fetcher={questionsFetcher}
        >
          <input type="hidden" name="from-questions" value={"true"} />
          {questions.map((question, i) => (
            <Group key={i}>
              <Input
                name={"questions"}
                placeholder={"Ex: How to use the product?"}
                value={question.text}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[i].text = e.target.value;
                  setQuestions(newQuestions);
                }}
              />
              <IconButton
                variant={"subtle"}
                onClick={() => removeQuestion(i)}
                colorPalette={"red"}
              >
                <TbTrash />
              </IconButton>
            </Group>
          ))}
          <Box>
            <Button size="sm" variant={"subtle"} onClick={addQuestion}>
              <TbPlus />
              Add question
            </Button>
          </Box>
        </SettingsSection>

        <SettingsSection
          id="text-input-placeholder"
          title="Text input placeholder"
          description="Set the placeholder text for the text input field"
          fetcher={textInputPlaceholderFetcher}
        >
          <Input
            name="textInputPlaceholder"
            value={textInputPlaceholder ?? ""}
            onChange={(e) => setTextInputPlaceholder(e.target.value)}
            placeholder="Ex: Ask me anything about the product"
          />
        </SettingsSection>

        <SettingsSection
          id="mcp-setup"
          title="MCP setup instructions"
          description="Show the MCP client setup instrctions on the widget"
          fetcher={mcpSetupFetcher}
        >
          <input type="hidden" name="from-mcp-setup" value={"true"} />
          <Switch
            name="showMcpSetup"
            checked={showMcpSetup}
            onCheckedChange={(e) => setShowMcpSetup(e.checked)}
          >
            Show it
          </Switch>
        </SettingsSection>
      </Stack>
      <Stack flex={1} position={"sticky"} top={"80px"}>
        <Stack justify={"center"} align={"center"}>
          <Text fontWeight={"medium"}>Preview</Text>
          <AskAIButton scrape={liveScrape as Scrape} />
        </Stack>

        <Stack rounded={"md"} overflow={"hidden"} w={"full"} h={"600px"}>
          <ChatBoxProvider
            scrape={liveScrape as Scrape}
            thread={null}
            messages={[]}
            embed={false}
            admin={true}
            token={null}
            fullscreen={false}
          >
            <ChatboxContainer>
              <ChatBox />
            </ChatboxContainer>
          </ChatBoxProvider>
        </Stack>
      </Stack>
    </Group>
  );
}
