import {
  Group,
  Stack,
  Text,
  Link as ChakraLink,
  Heading,
  Input,
  Spinner,
  Box,
  SimpleGrid,
  GridItem,
  Image,
} from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import {
  TbApi,
  TbArrowRight,
  TbBrandOpenai,
  TbCircleCheck,
  TbCode,
  TbMarkdown,
  TbMessage,
  TbRobotFace,
  TbSettings,
  TbWorld,
} from "react-icons/tb";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useOpenScrape } from "./use-open-scrape";
import { Tooltip } from "~/components/ui/tooltip";

const maxW = "1200px";

function Container({ children }: PropsWithChildren) {
  return (
    <Group maxW={maxW} mx={"auto"} w="full" justifyContent={"space-between"}>
      {children}
    </Group>
  );
}

function Navbar() {
  return (
    <Stack
      as="nav"
      position={"sticky"}
      top={0}
      bg={"white"}
      zIndex={1}
      borderBottom={"1px solid"}
      borderColor={"brand.outline-subtle"}
      p={4}
      px={8}
    >
      <Container>
        <Group>
          <Text
            fontSize={"xl"}
            fontWeight={"bold"}
            bgGradient={"to-r"}
            gradientFrom={"brand.500"}
            gradientTo={"brand.300"}
            bgClip="text"
            color={"transparent"}
          >
            CrawlChat
          </Text>
        </Group>
        <Group gap={6}>
          <ChakraLink href={"/#use-cases"} display={["none", "flex"]}>
            Use cases
          </ChakraLink>
          <ChakraLink href={"/#pricing"} display={["none", "flex"]}>
            Pricing
          </ChakraLink>
          <Button
            variant={"outline"}
            colorPalette={"brand"}
            size={"lg"}
            asChild
          >
            <Link to={"/login"}>
              Login
              <TbArrowRight />
            </Link>
          </Button>
        </Group>
      </Container>
    </Stack>
  );
}

function TryItOut() {
  const {
    scrapeFetcher,
    scraping,
    stage,
    roomId,
    mpcCmd,
    disable,
    openChat,
    downloadLlmTxt,
    copyMcpCmd,
  } = useOpenScrape();

  return (
    <Stack maxW={"500px"} w="full" gap={4} alignItems={"center"}>
      {stage === "idle" && (
        <scrapeFetcher.Form
          className="w-full"
          method="post"
          action="/open-scrape"
          style={{ width: "100%" }}
        >
          <Group w="full">
            <input type="hidden" name="intent" value="scrape" />
            <input type="hidden" name="roomId" value={roomId} />
            <Input
              name="url"
              placeholder="Enter your website URL"
              size={"2xl"}
              disabled={disable}
              flex={1}
            />
            <Button
              size={"2xl"}
              type="submit"
              loading={disable}
              colorPalette={"brand"}
            >
              Try it
              <TbArrowRight />
            </Button>
          </Group>
        </scrapeFetcher.Form>
      )}

      {stage !== "idle" && stage !== "saved" && (
        <Spinner size={"xl"} color={"brand.fg"} />
      )}
      {stage === "saved" && (
        <Text fontSize={"6xl"} color={"brand.fg"}>
          <TbCircleCheck />
        </Text>
      )}

      <Group justifyContent={"center"}>
        <Text
          fontSize={"sm"}
          opacity={0.5}
          truncate
          maxW={["300px", "500px", "600px"]}
        >
          {scrapeFetcher.data?.error ? (
            <span className="text-red-500">{scrapeFetcher.data?.error}</span>
          ) : stage === "scraping" ? (
            <span>Scraping {scraping?.url ?? "url..."}</span>
          ) : stage === "saved" ? (
            <span>Scraped and ready!</span>
          ) : (
            <span>Fetches 25 pages and makes it LLM ready!</span>
          )}
        </Text>
      </Group>

      <Group w="full">
        <Button
          flex={1}
          variant={"subtle"}
          disabled={stage !== "saved"}
          size={"2xl"}
          onClick={openChat}
        >
          <TbMessage />
          Chat
        </Button>
        <Button
          flex={1}
          variant={"subtle"}
          disabled={stage !== "saved"}
          size={"2xl"}
          onClick={downloadLlmTxt}
        >
          <TbMarkdown />
          LLM.txt
        </Button>
        <Button
          flex={1}
          variant={"subtle"}
          disabled={stage !== "saved"}
          size={"2xl"}
          onClick={copyMcpCmd}
        >
          <TbRobotFace />
          MCP
        </Button>
      </Group>
    </Stack>
  );
}

function Hero() {
  return (
    <Stack w={"full"} px={8} py={12}>
      <Container>
        <Stack alignItems={"center"} w="full" gap={6}>
          <Text
            bg="brand.subtle"
            p={2}
            px={4}
            fontSize={"sm"}
            color={"brand.fg"}
            fontWeight={"medium"}
            rounded={"full"}
          >
            Connect documentations to MCP!
          </Text>

          <Heading
            as="h1"
            fontSize={"6xl"}
            fontWeight={"bolder"}
            lineHeight={1}
            textAlign={"center"}
          >
            Make your content LLM ready!
          </Heading>

          <Text
            as="h2"
            fontSize={"xl"}
            textAlign={"center"}
            maxW={"600px"}
            opacity={0.6}
          >
            Give URL and it will scrape all the content and turns them
            embeddings for RAG. You can share chat links or embed it on your
            website. Or use API to query the content.
          </Text>

          <TryItOut />
        </Stack>
      </Container>
    </Stack>
  );
}

function LandingHeading({ children }: PropsWithChildren) {
  return (
    <Heading
      as="h2"
      fontSize={"2xl"}
      fontWeight={"bold"}
      textAlign={"center"}
      position={"relative"}
      mb={4}
    >
      {children}
      <Box
        position={"absolute"}
        bottom={-1.5}
        left={"50%"}
        w={6}
        h={1}
        bg="brand.fg"
        rounded={"full"}
        transform={"translateX(-50%)"}
      />
    </Heading>
  );
}

function Demo() {
  return (
    <Stack w={"full"} px={8} py={12}>
      <Container>
        <Box rounded={"2xl"} overflow={"hidden"} w={"full"} h={"full"}>
          <video
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            poster="/demo-poster.png"
            src="https://slickwid-public.s3.us-east-1.amazonaws.com/CrawlChat+Demo.mp4"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      </Container>
    </Stack>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <TbWorld />,
      title: "Scrape",
      description:
        "Input your website URL and let CrawlChat crawl the content. We convert pages to markdown, create embeddings, and store them in a vector database.",
    },
    {
      icon: <TbSettings />,
      title: "Customise",
      description:
        "Once the content is scraped, you can customise how the content is to be used. Set custom rules, custom data, system prompts etc.",
    },
    {
      icon: <TbMessage />,
      title: "Chat & APIs",
      description:
        "There are multiple ways you use the data for AI. Easiest is to just embed the chat widget on your website. API's to query and MCP servers are also available!",
    },
  ];
  return (
    <Stack w={"full"} px={8} py={12} bg="brand.gray.50">
      <Container>
        <Stack alignItems={"center"} w="full" gap={6}>
          <LandingHeading>How it works</LandingHeading>
          <SimpleGrid columns={[1, 2, 3]} gap={6} w={"full"}>
            {steps.map((step, i) => (
              <GridItem key={step.title}>
                <Stack
                  key={step.title}
                  gap={2}
                  bgGradient={"to-b"}
                  gradientFrom={"brand.subtle"}
                  gradientTo={"brand.muted"}
                  p={6}
                  px={8}
                  rounded={"2xl"}
                  h="full"
                >
                  <Text fontSize={"5xl"} color="brand.fg">
                    {step.icon}
                  </Text>
                  <Text fontSize={"2xl"} fontWeight={"medium"}>
                    {i + 1}. {step.title}
                  </Text>
                  <Text opacity={0.6}>{step.description}</Text>
                </Stack>
              </GridItem>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Stack>
  );
}

function UseCases() {
  const useCases = [
    {
      icon: <TbMessage />,
      title: "Embed chat",
      description:
        "It is quite common to have a heavy documentation or content for your service. It quickly gets complicated to create a chat bot that learns from all your content and answers users queries. CrawlChat takes care of it and let's you embed the chatbot with few clicks!",
      integrations: [
        {
          image: "/icons/openai.webp",
          tooltip: "Chat is powered by OpenAI",
        },
        {
          image: "/icons/claude.png",
          tooltip: "Chat is powered by Claude",
        },
      ],
      integrationTag: "Integrated with",
    },
    {
      icon: <TbCode />,
      title: "API",
      description:
        "Want to use your content in other apps? CrawlChat provides APIs using which you can query the conentent and integrate it in your own apps. Rest all is taken care by CrawlChat!",
      integrations: [
        {
          image: "/icons/rest.png",
          tooltip: "Integrate with REST API",
        },
        {
          image: "/icons/websocket.png",
          tooltip: "Integrate with WebSocket",
        },
      ],
      integrationTag: "Integrate with",
    },
    {
      icon: <TbRobotFace />,
      title: "MCP Server",
      description:
        "Model Context Protocol (MCP) has been very well adopted by the LLM systems already. It is a way to connect external systems to the LLMs which are generic in nature and don't know much about your services and content. CrawlChat let's you get MCP server for your content without any extra effort!",
      integrations: [
        {
          image: "/icons/cursor.png",
          tooltip: "Works with Cursor",
        },
        {
          image: "/icons/windsurf.png",
          tooltip: "Works with Windsurf",
        },
        {
          image: "/icons/claude.png",
          tooltip: "Works with Claude",
        },
      ],
      integrationTag: "Works with",
    },
  ];

  return (
    <Stack w={"full"} px={8} py={12}>
      <Container>
        <Stack alignItems={"center"} w="full" gap={6}>
          <LandingHeading>Use cases</LandingHeading>
          <Stack w={"full"} gap={10}>
            {useCases.map((useCase) => (
              <Stack
                key={useCase.title}
                bgGradient={"to-br"}
                gradientFrom={"brand.fg"}
                gradientTo={"brand.emphasized"}
                color="white"
                w="full"
                p={8}
                rounded={"sm"}
                position={"relative"}
                pr={40}
                overflow={"hidden"}
              >
                <Text
                  as="h3"
                  fontSize={"3xl"}
                  fontWeight={"medium"}
                  lineHeight={1}
                >
                  {useCase.title}
                </Text>
                <Text opacity={0.6} fontSize={"lg"}>
                  {useCase.description}
                </Text>
                {useCase.integrations && (
                  <Stack mt={4}>
                    <Text fontSize={"xs"} opacity={0.5}>
                      {useCase.integrationTag ?? "Powered by"}
                    </Text>
                    <Group gap={4}>
                      {useCase.integrations?.map((integration, key) => (
                        <Tooltip
                          key={key}
                          content={integration.tooltip}
                          showArrow
                        >
                          <Image src={integration.image} w={10} h={10} />
                        </Tooltip>
                      ))}
                    </Group>
                  </Stack>
                )}
                <Box
                  position={"absolute"}
                  top={0}
                  right={0}
                  fontSize={"200px"}
                  transform={"translateX(25%) translateY(-25%) rotate(10deg)"}
                  opacity={0.2}
                >
                  {useCase.icon}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
}

export default function LandingPage() {
  return (
    <Stack gap={0} w="full">
      <Navbar />
      <Hero />
      <Demo />
      <HowItWorks />
      <UseCases />
    </Stack>
  );
}
