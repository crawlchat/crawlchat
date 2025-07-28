import {
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Heading,
  Image,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { TbArrowRight, TbBrandDiscordFilled, TbCheckbox } from "react-icons/tb";

export function meta() {
  return [
    {
      title: "CrawlChat Discord Bot",
      content:
        "Make AI chatbot from your documentation that handles your support queries. Embed it in your website, Discord, or Slack.",
    },
  ];
}

export default function DiscordBotPage() {
  const details = useMemo(() => {
    return {
      handle: "@crawlchat",
      installLink:
        "https://discord.com/oauth2/authorize?client_id=1346845279692918804",
    };
  }, []);
  const features = useMemo(() => {
    return [
      "Tag and ask questions",
      "Tag and make it learn",
      "Available 24x7",
      "Works in most of the languages",
      "Support tickets",
    ];
  }, []);
  const tags = useMemo(() => {
    return ["RAG", "AI", "Knowledge base", "Support"];
  }, []);

  return (
    <Stack minH={"100vh"} justify={"center"} align={"center"} p={6}>
      <Flex gap={6} direction={["column", "row"]}>
        <Stack>
          <Image
            src="/discord-logo.png"
            alt="Discord Bot"
            w={160}
            h={160}
            border="1px solid"
            borderColor={"brand.outline"}
            rounded={"2xl"}
          />
        </Stack>
        <Stack>
          <Group>
            <Badge colorPalette={"brand"} variant={"surface"}>
              <TbBrandDiscordFilled />
              Discord Bot
            </Badge>
            <Text fontWeight={"bold"} opacity={0.4}>
              {details.handle}
            </Text>
          </Group>
          <Heading size={"2xl"}>
            CrawlChat - AI Chatbot for your documents
          </Heading>
          <Text>
            Discord bot that can answer your community queries with the
            knowledge base made on CrawlChat.
          </Text>
          <Flex direction={["column", "row"]} gap={2}>
            <Button colorPalette={"brand"} variant={"subtle"} asChild>
              <a href={"/login"}>Setup knowledge base</a>
            </Button>
            <Button colorPalette={"brand"} asChild>
              <a href={details.installLink}>
                Add to your server
                <TbArrowRight />
              </a>
            </Button>
          </Flex>
          <Stack my={4}>
            <Heading size={"md"} opacity={0.5}>
              Features
            </Heading>
            <List.Root gap="2" variant="plain" align="center">
              {features.map((feature) => (
                <List.Item key={feature}>
                  <List.Indicator asChild color="brand.fg">
                    <TbCheckbox />
                  </List.Indicator>
                  {feature}
                </List.Item>
              ))}
            </List.Root>
            <Flex gap={2}>
              {tags.map((tag) => (
                <Badge key={tag} variant={"surface"}>
                  {tag}
                </Badge>
              ))}
            </Flex>
          </Stack>
          <Stack>
            <Heading size={"md"} opacity={0.5}>
              Screenshots
            </Heading>
            <Image
              src="/discord-sample.png"
              alt="Discord Bot"
              maxW={600}
              w={"full"}
              rounded={"2xl"}
            />
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
}
