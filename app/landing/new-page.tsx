import {
  Group,
  Stack,
  Text,
  Link as ChakraLink,
  Heading,
  Input,
  Spinner,
} from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import {
  TbArrowRight,
  TbCircleCheck,
  TbMarkdown,
  TbMessage,
  TbRobotFace,
} from "react-icons/tb";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useOpenScrape } from "./use-open-scrape";

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
            <Button size={"2xl"} type="submit" loading={disable}>
              Try it
              <TbArrowRight />
            </Button>
          </Group>
        </scrapeFetcher.Form>
      )}

      {stage !== "idle" && stage !== "saved" && <Spinner color={"brand.fg"} />}
      {stage === "saved" && (
        <Text fontSize={"4xl"} color={"brand.fg"}>
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
    <Stack w={"full"} p={4} py={12}>
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

export default function LandingPage() {
  return (
    <Stack gap={0} w="full">
      <Navbar />
      <Hero />
    </Stack>
  );
}
